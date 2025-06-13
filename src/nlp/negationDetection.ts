import { wordNetRelations } from "@/nlp/resources/wordNetRelations";
import { negationPrefixes } from "@/nlp/resources/wordNetNegationPrefixes";
import { isValidWord, isValidSentence } from "@/nlp/utility";
import nlp from "compromise";

// Define type interfaces to match the data structure
interface WordRelation {
  antonyms: string[];
  synonyms: string[];
  inflections: string[];
}

interface NegationPrefixes {
  [word: string]: string[];
}

interface WordRelations {
  [word: string]: WordRelation;
}

// for checking proximity of 'not' to verb in sentence
const vicinity_size = 3;

// Cast the imported data to the correct type
const typedWordRelations = wordNetRelations as WordRelations;
const typedNegationPrefixes = negationPrefixes as NegationPrefixes;

/**
 * Checks if a word is a valid "negation verb" as defined by:
 * 1. Starting with a negation prefix (dis, mis, de, in, un)
 * 2. The remaining part after removing the prefix is a valid verb
 * 3. That remaining part is a valid antonym of the original word
 *
 * @param verb The verb to check
 * @returns boolean indicating if the verb is a valid negation verb
 */
export function isNegationVerb(verb: string): boolean {
  let verbExists = false;
  // Check if input verb is in our negation prefixes dictionary
  for (const key in negationPrefixes) {
    if (verb in typedNegationPrefixes[key]) {
      verbExists = true;
      break;
    }
  }

  if (!verbExists) {
    console.error("verb does not exist in negation prefixes dictionary");
    return false;
  }

  // Check if the verb exists in our data
  if (!(verb in typedWordRelations)) {
    return false;
  }

  // List of valid negation prefixes
  const prefixes = ["dis", "mis", "de", "in", "un"];

  // Find if the verb starts with one of the prefixes
  const matchingPrefix = prefixes.find((prefix) => verb.startsWith(prefix));

  // If no matching prefix, not a negation verb
  if (!matchingPrefix) {
    return false;
  }

  // Get the remaining part after removing the prefix
  const remaining = verb.slice(matchingPrefix.length);

  // Check if the remaining part is a valid verb (exists in wordRelations)
  if (!(remaining in typedWordRelations)) {
    return false;
  }

  // Get the antonyms of the original verb
  const antonyms = typedWordRelations[verb].antonyms;

  // If the remaining part is in the list of antonyms for the original verb,
  // then it's a valid negation verb
  return antonyms.includes(remaining);
}

/**
 * Checks if the word 'not' appears within the specified vicinity of a target word in an array of tokens.
 *
 * @param sent_tokens - Array of string tokens
 * @param word - Target word to check for 'not' in its vicinity
 * @param vicinity_size - Number of tokens to check on each side of the target word
 * @returns boolean - True if 'not' is found within the vicinity, otherwise false
 */
function negationIsInWordVicinity(
  sent_tokens: string[],
  word: string,
  vicinity_size: number,
): boolean {
  // Find all indices where the target word appears
  const wordIndices: number[] = [];

  for (let i = 0; i < sent_tokens.length; i++) {
    if (sent_tokens[i] === word) {
      wordIndices.push(i);
    }
  }

  // If the word doesn't appear in the tokens, return false
  if (wordIndices.length === 0) {
    console.log('word: ', word);
    return false;
  }

  // Check for 'not' in the vicinity of each occurrence of the word
  for (const index of wordIndices) {
    // Define the vicinity range (ensuring we don't go out of bounds)
    const startIdx = Math.max(0, index - vicinity_size);
    const endIdx = Math.min(sent_tokens.length - 1, index + vicinity_size);

    // Check each token in the vicinity
    for (let i = startIdx; i <= endIdx; i++) {
      if ((i !== index) && (sent_tokens[i] == "not" || sent_tokens[i] == "no")) {
        return true;
      }
    }
  }

  // 'not' was not found in the vicinity of any occurrence of the word
  return false;
}

/**
 * Get word variations using compromise.js
 *
 * @param token - The word to find variations for
 * @param type - Whether to get synonyms or antonyms
 * @returns string[] - Array of word variations
 */
function getWordVariations(
  token: string,
  type: "synonyms" | "antonyms",
): string[] {
  // Create a doc with the token
  const doc = nlp(token);

  let variations: string[] = [];

  variations.push(doc.verbs().toPastTense().text());

  // Get all forms of the word
  if (doc.has("#Verb")) {
    // Get verb conjugations - use only the methods with definite TypeScript support

    variations = [
      doc.verbs().toInfinitive().text(),
      doc.verbs().toPresentTense().text(),
      doc.verbs().toPastTense().text(),
      doc.verbs().toGerund().text(), // -ing form
    ].filter(Boolean);

    // Try to get the conjugated forms as strings - this avoids type issues
    try {
      const conjugateStr = JSON.stringify(doc.verbs().conjugate());
      const conjugateObj = JSON.parse(conjugateStr);

      // Safely try to extract past participle if available
      if (
        Array.isArray(conjugateObj) &&
        conjugateObj.length > 0 &&
        typeof conjugateObj[0] === "object" &&
        conjugateObj[0] !== null
      ) {
        // TypeScript-safe way to check for and access properties
        const firstConjugation = conjugateObj[0];
        const keys = Object.keys(firstConjugation);

        // Look for past participle or similar keys
        for (const key of keys) {
          if (
            key.toLowerCase().includes("participle") &&
            typeof firstConjugation[key] === "string" &&
            firstConjugation[key]
          ) {
            variations.push(firstConjugation[key]);
          }
        }
      }
    } catch (e) {
      // If any error occurs during conjugation extraction, just continue with what we have
      console.error("Error extracting verb conjugations:", e);
    }
  } else if (doc.has("#Noun")) {
    // Get noun forms (singular/plural)
    variations = [
      doc.nouns().toSingular().text(),
      doc.nouns().toPlural().text(),
    ].filter(Boolean);
  } else if (doc.has("#Adjective")) {
    // Get adjective forms (comparative/superlative if available)
    variations = [
      doc.adjectives().text(), // base form
      doc.adjectives().toComparative().text(),
      doc.adjectives().toSuperlative().text(),
    ].filter(Boolean);
  }

  // Add the original token if not already included
  if (!variations.includes(token)) {
    variations.push(token);
  }

  // Remove duplicates and empty strings
  variations = [...new Set(variations)].filter(Boolean);

  // For antonyms, we still need to rely on the dictionary as compromise doesn't have built-in antonyms
  if (type === "antonyms" && token in typedWordRelations) {
    return typedWordRelations[token].antonyms;
  }

  return variations;
}

function existsSynonymOrAntonymOccurrence(
  token: string,
  sent: string,
  type: "synonyms" | "antonyms",
): boolean {
  const sent_tokens = sent.split(" ");

  // Initialize with empty arrays in case token is not in the dictionary
  let wordnet_variations: string[] = [];
  let wordnet_inflections: string[] = [];
  let wordnet_variations_syn: string[] = [];

  // Safely access the dictionary - only if token exists
  if (token in typedWordRelations) {
    wordnet_variations = typedWordRelations[token][type] || [];
    wordnet_variations_syn = typedWordRelations[token].synonyms || [];
    wordnet_inflections = typedWordRelations[token].inflections || [];
  }
  // Use compromise.js to get word variations instead of the dictionary lookup
  // const variations = getWordVariations(token, type);
  const variations_syn = getWordVariations(token, "synonyms");
  const all_synonyms = [
    ...new Set([
      ...wordnet_variations_syn,
      ...wordnet_inflections,
      ...variations_syn,
    ]),
  ];
  let combined = [...new Set([...variations_syn, ...wordnet_variations])];

  if (type == "synonyms") {
    combined = [...new Set([...combined, ...wordnet_inflections])];
  }

  // easy case: exact token match
  if (sent_tokens.includes(token)) {
    if (type == "synonyms") {
      if (!negationIsInWordVicinity(sent_tokens, token, vicinity_size))
        return true;
      else return false;
    } else {
      // antonyms
      if (negationIsInWordVicinity(sent_tokens, token, vicinity_size)) {
        return true;
      } else {
        return false;
      }
    }
  }

  // medium case: synonym is negated
  for (const syn of all_synonyms) {
    if (sent_tokens.includes(syn)) {
      if (type == "synonyms") {
        if (negationIsInWordVicinity(sent_tokens, syn, vicinity_size))
          return false;
        else return true;
      } else {
        // antonyms
        if (negationIsInWordVicinity(sent_tokens, syn, vicinity_size)) {
          return true;
        } else {
          return false;
        }
      }
    }
  }

  // harder case: token does not appear exactly in sent
  for (const n of combined) {
    if (sent_tokens.includes(n)) {
      if (type == "synonyms") {
        if (!negationIsInWordVicinity(sent_tokens, n, vicinity_size))
          return true;
        else return false;
      } else {
        // antonyms
        if (negationIsInWordVicinity(sent_tokens, n, vicinity_size))
          return false;
        else return true;
      }
    }
  }

  return false;
}

/**
 * Detects if a word appears in a sentence, either in negated or non-negated form
 * @param {string} word_phrase - The word to search for (either one or two token phrase e.g. "pay", "inform", "not request", "not report")
 * @param {boolean} searching_for_negation - Whether to search for negated form
 * @param {string} sent - The sentence to analyze
 * @returns {Promise<boolean>} - Whether the condition is met
 */
export async function checkWordOccurrence(
  word_phrase: string,
  searching_for_negation: boolean,
  sent: string,
): Promise<boolean> {
  // Normalize inputs
  word_phrase = word_phrase.toLowerCase().trim();
  sent = sent.toLowerCase().trim();
  // get tokens in input phrase
  const word_phrase_tokens = word_phrase.split(" ");
  // sent must be a valid sentence to continue
  if (!isValidSentence(sent)) return false;
  
  // word_phrase must be exactly one or two tokens long
  if (word_phrase_tokens.length > 2 || word_phrase_tokens.length < 1) {
    console.error("incorrect number of tokens for input word phrase...");
    return false;
  } else {
    if (word_phrase_tokens.length == 2) {
      // second token must be a valid word
      if (!isValidWord(word_phrase_tokens[1])) {
        console.error("second token from word_phrase is invalid...");
        return false;
      }

      // the first one MUST indicate negation ("not")
      if (word_phrase_tokens[0] != "not") {
        console.error(
          'first token from word_phrase should be "not" but it is not...',
        );
        return false;
      }

      if (searching_for_negation) {
        // 10 not engage (is_negative_word_phrase = 1)
        // 11 not disengage (is_negative_word_phrase = 0)
        // strategy is to search for second_token and synonyms in sent (and to ensure there is no negation related to second_token)
        return existsSynonymOrAntonymOccurrence(
          word_phrase_tokens[1],
          sent,
          "synonyms",
        );
      } else {
        // strategy is to search for antonym of second_token and then search for its presence in sent (and to ensure no negation associated with the antonym)
        return existsSynonymOrAntonymOccurrence(
          word_phrase_tokens[1],
          sent,
          "antonyms",
        );
      }
    } else {
      
      // can only be 1 token
      // word must be a valid word to continue
      if (!isValidWord(word_phrase_tokens[0])) {
        console.error("first token from word_phrase is invalid...");
        return false;
      }

      if (searching_for_negation) {
        // 01 disengage (is_negative_word_phrase = 1)
        // 00 engage (is_negative_word_phrase = 0)
        // strategy is to search for antonyms for token and check presence in sent (ensure no negation relevant to the antonyms)

        const containsAntonym = existsSynonymOrAntonymOccurrence(
          word_phrase_tokens[0],
          sent,
          "antonyms",
        );
        const containsSynonym = existsSynonymOrAntonymOccurrence(
          word_phrase_tokens[0],
          sent,
          "synonyms",
        );
        return containsAntonym || containsSynonym;
      } else {
        // strategy is to search for synonyms for token and check presence in sent (ensure no negation relevant to the synonyms)
        return !existsSynonymOrAntonymOccurrence(
          word_phrase_tokens[0],
          sent,
          "synonyms",
        );
      }
    }
  }
}
