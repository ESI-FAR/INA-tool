import Fuse from "fuse.js";
import nlp from "compromise";
import { Statement } from "@/lib/schema";

// Define interfaces for compromise.js conjugation results
interface VerbConjugation {
  PresentTense?: string;
  PastTense?: string;
  FutureTense?: string;
  Gerund?: string;
  [key: string]: string | undefined;
}

interface AdjectiveConjugation {
  Comparative?: string;
  Superlative?: string;
  [key: string]: string | undefined;
}

// Maintain a global cache of word lookups
const wordCache: Record<string, Promise<string[]>> = {};
// Keep track of precomputed word similarities
const similarityCache: Record<string, Record<string, boolean>> = {};

/**
 * Preloads word data for all words in all statements at once
 * This should dramatically reduce the number of separate lookups
 * and reduce the size of search space
 * @param statements Array of Statement objects to extract words from
 * @returns A promise that resolves when preloading is complete
 */
export async function preloadWordNetForStatements(
  statements: Statement[],
): Promise<void> {
  console.log("Starting word data preloading...");
  const startTime = performance.now();

  // Create a set of all unique words across all statements
  const allWords = new Set<string>();
  const relevantFields = [
    "Attribute",
    "Deontic",
    "Aim",
    "Direct Object",
    "Indirect Object",
    "Activation Condition",
    "Execution Constraint",
    "Or Else",
  ];

  // Extract all words from all fields in all statements
  for (const statement of statements) {
    for (const field of relevantFields) {
      const value = statement[field as keyof Statement];

      if (!value || typeof value !== "string") continue;

      // Split the value into individual words
      const words = value
        .toLowerCase()
        .split(/\s+/)
        .filter(
          (word) =>
            word.length > 2 &&
            !/^[0-9.,;:!?()[\]{}'"<>]+$/.test(word) &&
            ![
              "the",
              "and",
              "for",
              "with",
              "from",
              "that",
              "this",
              "these",
              "those",
            ].includes(word),
        );

      words.forEach((word) => allWords.add(word));
    }
  }

  // Prepare batched lookup
  const words = Array.from(allWords);
  console.log(`Preloading word data for ${words.length} unique words`);

  // Create and cache promises for all words at once
  for (const word of words) {
    if (!wordCache[word]) {
      wordCache[word] = getWordForms(word);
    }
  }

  // Wait for all lookups to complete in parallel
  await Promise.all(Object.values(wordCache));

  // Pre-compute similarities between common words to avoid repeated comparisons
  await precomputeSimilarities(words);

  const endTime = performance.now();
  console.log(
    `Word data preloading completed in ${(endTime - startTime) / 1000} seconds`,
  );
}

/**
 * Precompute similarities between words to avoid repeated lookups
 */
async function precomputeSimilarities(words: string[]): Promise<void> {
  // Only compare words that are likely to appear in the same context
  // This is a heuristic to reduce the number of comparisons
  for (let i = 0; i < words.length; i++) {
    const word1 = words[i];
    similarityCache[word1] = similarityCache[word1] || {};

    // Only compare with the next few words to limit complexity
    // You can adjust this number based on performance needs
    const maxCompares = Math.min(50, words.length - i - 1);

    for (let j = i + 1; j < i + 1 + maxCompares; j++) {
      if (j >= words.length) break;

      const word2 = words[j];
      const similarity = await matchWithWordFormsCached(word1, word2);

      similarityCache[word1][word2] = similarity;
      // Store the reverse relationship too
      similarityCache[word2] = similarityCache[word2] || {};
      similarityCache[word2][word1] = similarity;
    }
  }

  console.log("Precomputed word similarities");
}

/**
 * Get different forms of a word using compromise.js
 */
async function getWordForms(word: string): Promise<string[]> {
  const lowerWord = word.toLowerCase();

  // Return cached result if available
  if (Object.prototype.hasOwnProperty.call(wordCache, lowerWord)) {
    const words = await wordCache[lowerWord]; // Await only if the key exists
    if (words?.length > 0) {
      // Prevents TypeError if words is undefined
      return words;
    }
  }

  try {
    // Use compromise to analyze the word
    const doc = nlp(lowerWord);
    const wordForms: string[] = [lowerWord]; // Always include the original word

    // Get verb conjugations
    const verbs = doc.verbs();
    if (verbs.found) {
      // if (lowerWord in ['pay', 'pays', 'paid', 'payment']) {
      //   console.log('verb forms of ' + lowerWord + ': ', verbs);
      // }

      // Get verb conjugation result with proper typing
      const conjugations = verbs.conjugate()[0] as VerbConjugation;

      // Get present tense
      if (
        conjugations?.PresentTense &&
        !wordForms.includes(conjugations.PresentTense)
      ) {
        // if (lowerWord in ['pay', 'pays', 'paid', 'payment']) {
        //   console.log('present tense of ' + lowerWord + ': ', conjugations.PresentTense);
        // }

        wordForms.push(conjugations.PresentTense);
      }

      // Get past tense
      if (
        conjugations?.PastTense &&
        !wordForms.includes(conjugations.PastTense)
      ) {
        // if (lowerWord in ['pay', 'pays', 'paid', 'payment']) {
        //   console.log('past tense of ' + lowerWord + ': ', conjugations.PastTense);
        // }
        wordForms.push(conjugations.PastTense);
      }

      // Get future tense (remove 'will ' prefix)
      if (conjugations?.FutureTense) {
        const future = conjugations.FutureTense.replace("will ", "");
        // if (lowerWord in ['pay', 'pays', 'paid', 'payment']) {
        //   console.log('future tense of ' + lowerWord + ': ', future);
        // }
        if (!wordForms.includes(future)) wordForms.push(future);
      }

      // Get gerund form (using verbs ending as 'ing' as nouns e.g., 'we both love the activity of hiking')
      if (conjugations?.Gerund && !wordForms.includes(conjugations.Gerund)) {
        // if (lowerWord) {
        //   console.log('gerund form of ' + lowerWord + ': ', conjugations.Gerund);
        // }
        wordForms.push(conjugations.Gerund);
      }
    }

    // Get noun forms
    const nouns = doc.nouns();
    if (nouns.found) {
      // Get plural form
      const plural = nouns.toPlural().text();
      if (plural && !wordForms.includes(plural)) wordForms.push(plural);

      // Get singular form
      const singular = nouns.toSingular().text();
      if (singular && !wordForms.includes(singular)) wordForms.push(singular);

      // if (lowerWord) {
      //     console.log('noun forms of ' + lowerWord + ': ', ' plural - ', plural, ' | singular - ', singular);
      // }
    }

    // Get adjective forms
    const adjectives = doc.adjectives();
    if (adjectives.found) {
      // Get adjective conjugation result with proper typing
      const adjConjugations = adjectives.conjugate()[0] as AdjectiveConjugation;

      // Get comparative form
      if (
        adjConjugations?.Comparative &&
        !wordForms.includes(adjConjugations.Comparative)
      ) {
        // if (lowerWord) {
        //     console.log('adjective comparative form of ' + lowerWord + ': ', adjConjugations.Comparative);
        // }

        wordForms.push(adjConjugations.Comparative);
      }

      // Get superlative form
      if (
        adjConjugations?.Superlative &&
        !wordForms.includes(adjConjugations.Superlative)
      ) {
        // if (lowerWord) {
        //     console.log('adjective superlative form of ' + lowerWord + ': ', adjConjugations.Superlative);
        // }

        wordForms.push(adjConjugations.Superlative);
      }
    }

    return wordForms;
  } catch (error) {
    console.error(`Error getting word forms for ${lowerWord}:`, error);
    // If there's an error, return the original word
    return [lowerWord];
  }
}

/**
 * Match two words using their different forms with cached results
 */
export async function matchWithWordFormsCached(
  word1: string,
  word2: string,
): Promise<boolean> {
  // Check if words are the same (optimization)
  if (word1 === word2) return true;

  // Handle empty strings
  if (!word1 || !word2) return false;

  // Check cached similarity result
  if (similarityCache[word1]?.[word2] !== undefined) {
    return similarityCache[word1][word2];
  }

  // Get word forms for both words from cache or compute them
  const [forms1, forms2] = await Promise.all([
    getWordForms(word1),
    getWordForms(word2),
  ]);

  // Check if any forms match
  const hasMatch = forms1.some((form1) =>
    forms2.some((form2) => form1 === form2),
  );

  // Cache the result
  similarityCache[word1] = similarityCache[word1] || {};
  similarityCache[word1][word2] = hasMatch;
  similarityCache[word2] = similarityCache[word2] || {};
  similarityCache[word2][word1] = hasMatch;

  return hasMatch;
}

/**
 * Reset all caches
 */
export function resetWordNetCache(): void {
  // Clear all cached data
  Object.keys(wordCache).forEach((key) => delete wordCache[key]);
  Object.keys(similarityCache).forEach((key) => delete similarityCache[key]);
  console.log("Word cache reset");
}

/**
 * Optimized version of fuzzyIncludes that uses cached word form lookups
 */
export async function fuzzyIncludesOptimized(
  word: string,
  sentence: string,
): Promise<boolean> {
  // Check for null values
  if (!word || !sentence) return false;

  // Simple substring check first (optimization)
  if (sentence.toLowerCase().includes(word.toLowerCase())) {
    return true;
  }

  // Standard fuzzy string matching second (optimization)
  if (fuzzyIncludesNonWN(word, sentence)) {
    return true;
  }

  // Now use compromise...

  // Process all words in parallel using cached lookups
  const sent_words = sentence.split(/\s+/);
  const word_words = word.split(/\s+/);

  // Map to an array of promises for matching each word
  const matchPromises: Promise<any>[] = [];

  for (const word_token of word_words) {
    const currentMatches = sent_words.map((w) =>
      matchWithWordFormsCached(w, word_token),
    );
    matchPromises.push(...currentMatches);
  }

  // Wait for all matches to complete and check if any are true
  const matchResults = await Promise.all(matchPromises);
  return matchResults.some((result) => result);
}

/**
 * Optimized version of fuzzyMatch that doesn't rely on Fuse.js for simple matching
 */
export function fuzzyMatchOptimized(stringA: string, stringB: string): boolean {
  // Handle empty strings
  if (!stringA || !stringB) return false;

  // Simple equality check
  if (stringA.toLowerCase() === stringB.toLowerCase()) {
    return true;
  }

  // Check if they're close enough in length
  const lengthA = stringA.length;
  const lengthB = stringB.length;
  const maxLength = Math.max(lengthA, lengthB);
  const minLength = Math.min(lengthA, lengthB);

  // If lengths are too different, consider it a non-match
  if ((maxLength - minLength) / maxLength > 0.3) {
    return false;
  }

  // Simple contains check for short strings
  if (
    stringA.toLowerCase().includes(stringB.toLowerCase()) ||
    stringB.toLowerCase().includes(stringA.toLowerCase())
  ) {
    return true;
  }

  // For longer strings, check word by word
  const wordsA = stringA.toLowerCase().split(/\s+/);
  const wordsB = stringB.toLowerCase().split(/\s+/);

  // Calculate word overlap
  const commonWords = wordsA.filter((wordA) =>
    wordsB.some(
      (wordB) =>
        wordA === wordB || wordA.includes(wordB) || wordB.includes(wordA),
    ),
  );

  // If enough words overlap, consider it a match
  const overlapRatio =
    commonWords.length / Math.min(wordsA.length, wordsB.length);
  return overlapRatio >= 0.5;
}

// Non-WordNet (vanilla) fuzzyInclude function
export function fuzzyIncludesNonWN(
  stringA: string,
  stringB: string,
  threshold = 0.5,
): boolean {
  // Handle empty strings
  if (!stringA || !stringB) return false;

  // Create a list containing the second string
  const list = [{ name: stringB }];

  // Configure Fuse
  const options = {
    includeScore: true, // Return the score
    keys: ["name"], // The property to search in
    threshold: threshold, // Set threshold
    // By default, Fuse.js uses 0 for perfect match and 1 is no match
  };

  const fuse = new Fuse(list, options);

  // Search for the first string
  const result = fuse.search(stringA);

  // If we have a match and its score is below our threshold, consider it a match
  if (result.length > 0) {
    if (result[0].score !== undefined) {
      return result[0].score <= threshold;
    } else {
      return false;
    }
  }

  return false;
}
