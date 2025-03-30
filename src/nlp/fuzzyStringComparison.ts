import Fuse from "fuse.js";
import natural from "natural";
import { Statement } from "@/lib/schema";

// Initialise wordnet instance
const wn = new natural.WordNet();
// Maintain a global cache of word lookups
const wordnetCache: Record<string, Promise<string[]>> = {};
// Keep track of precomputed word similarities
const similarityCache: Record<string, Record<string, boolean>> = {};

/**
 * Preloads WordNet for all words in all statements at once
 * This should dramatically reduce the number of separate lookups
 * and reduce the size of search space (by only looking at words from
 * WordNet that are relevant to the input statements
 * @param statements Array of Statement objects to extract words from
 * @returns A promise that resolves when preloading is complete
 */
export async function preloadWordNetForStatements(
  statements: Statement[],
): Promise<void> {
  console.log("Starting WordNet preloading...");
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
  console.log(`Preloading WordNet for ${words.length} unique words`);

  // Create and cache promises for all words at once
  for (const word of words) {
    if (!wordnetCache[word]) {
      wordnetCache[word] = getLemmas(word);
    }
  }

  // Wait for all lookups to complete in parallel
  await Promise.all(Object.values(wordnetCache));

  // Pre-compute similarities between common words to avoid repeated comparisons
  await precomputeSimilarities(words);

  const endTime = performance.now();
  console.log(
    `WordNet preloading completed in ${(endTime - startTime) / 1000} seconds`,
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
      const similarity = await matchWithLemmatizerCached(word1, word2);

      similarityCache[word1][word2] = similarity;
      // Store the reverse relationship too
      similarityCache[word2] = similarityCache[word2] || {};
      similarityCache[word2][word1] = similarity;
    }
  }

  console.log("Precomputed word similarities");
}

/**
 * Get lemmas for a word from WordNet with caching
 */
async function getLemmas(word: string): Promise<string[]> {
  const lowerWord = word.toLowerCase();

  // Return cached result if available
  if (Object.prototype.hasOwnProperty.call(wordnetCache, lowerWord)) {
    const words = await wordnetCache[lowerWord]; // Await only if the key exists
    if (words?.length > 0) {
      // Prevents TypeError if words is undefined
      return words;
    }
  }

  const promise = new Promise<string[]>((resolve) => {
    wn.lookup(lowerWord, (results) => {
      const lemmas = results.map((result) => result.lemma);
      // If no lemmas found, use the original word
      if (lemmas.length === 0) lemmas.push(lowerWord);
      resolve(lemmas);
    });
  });

  // Cache the promise
  wordnetCache[lowerWord] = promise;
  return promise;
}

/**
 * Match two words using WordNet lemmatization with cached results
 */
export async function matchWithLemmatizerCached(
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

  // Get lemmas for both words from cache or compute them
  const [lemmas1, lemmas2] = await Promise.all([
    getLemmas(word1),
    getLemmas(word2),
  ]);

  // Check if any lemmas match
  const hasMatch = lemmas1.some((lemma1) =>
    lemmas2.some((lemma2) => lemma1 === lemma2),
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
  Object.keys(wordnetCache).forEach((key) => delete wordnetCache[key]);
  Object.keys(similarityCache).forEach((key) => delete similarityCache[key]);
  console.log("WordNet cache reset");
}

/**
 * Optimized version of fuzzyIncludes that uses cached WordNet lookups
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

  // Now use WordNet...

  // Process all words in parallel using cached lookups
  const words = sentence.split(/\s+/);

  // Map to an array of promises for matching each word
  const matchPromises = words.map((w) => matchWithLemmatizerCached(w, word));

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
