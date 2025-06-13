/**
 * Checks if the input string is a word consisting of only alphabetical characters.
 * A valid word must:
 * - Contain at least 1 character
 * - Contain only alphabetical characters (a-z, A-Z)
 * - No punctuation, numbers, spaces, or other characters
 *
 * @param {string} input - The string to check
 * @returns {boolean} - True if the input is a valid word, false otherwise
 */
export function isValidWord(input: string): boolean {
  // Check if input is actually a string
  if (typeof input !== "string") {
    return false;
  }

  // The regex pattern:
  // ^ - Start of string
  // [a-zA-Z]+ - One or more alphabetical characters (upper or lowercase)
  // $ - End of string
  const wordRegex = /^[a-zA-Z][a-zA-Z-]*$/;

  return wordRegex.test(input);
}

/* A valid sentence must:
 * - Contain at least one word with at least 2 alphabetical characters
 * - Can contain punctuation, numbers, and spaces
 *
 * @param {string} input - The string to check
 * @returns {boolean} - True if the input is a valid sentence, false otherwise
 */
export function isValidSentence(input: string) {
  // Check if input is actually a string
  if (typeof input !== "string") {
    return false;
  }

  // Trim the input to handle leading/trailing whitespace
  const trimmedInput = input.trim();

  // Check if the input is empty after trimming
  if (trimmedInput.length === 0) {
    return false;
  }

  // Split the input into words (tokens) based on whitespace
  const words = trimmedInput.split(/\s+/);

  // Check if there's at least one word with 2+ alphabetical characters
  const hasValidWord = words.some((word) => {
    // Count alphabetical characters in the word
    const alphaCount = (word.match(/[a-zA-Z]/g) || []).length;
    return alphaCount >= 2;
  });

  return hasValidWord;
}
