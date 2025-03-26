import Fuse from 'fuse.js';
import natural from 'natural';
const wn = new natural.WordNet();

// Check if two words match using WordNet lemmatization
function matchWithLemmatizer(word1: string, word2: string) : Promise<boolean> {
    return new Promise((resolve) => {
        // Handle empty strings
        if (!word1 || !word2) {
            resolve(false);
            return;
        }

        wn.lookup(word1.toLowerCase(), (results1) => {
            const lemmas1 = results1.map(result => result.lemma);
            // If no lemmas found, use the original word
            if (lemmas1.length === 0) lemmas1.push(word1.toLowerCase());

            wn.lookup(word2.toLowerCase(), (results2) => {
                const lemmas2 = results2.map(result => result.lemma);
                // If no lemmas found, use the original word
                if (lemmas2.length === 0) lemmas2.push(word2.toLowerCase());

                // Check if any lemmas match between the two words
                const hasMatch = lemmas1.some(lemma1 =>
                    lemmas2.some(lemma2 => lemma1 === lemma2)
                );

                resolve(hasMatch);
            });
        });
    });
}

// Function to check semantic match, considering synonyms, word forms (inflections), and senses
export async function fuzzyIncludes(word: string, sentence: string): Promise<boolean> {
    // Check for null values
    if (!word || !sentence) return false;

    // Simple substring check first (optimization)
    if (sentence.toLowerCase().includes(word.toLowerCase())) {
        return true;
    }

    // Tokenize the sentence (split by spaces)
    const words = sentence.split(/\s+/);

    for (const w of words) {
        try {
            const isMatch = await matchWithLemmatizer(w, word);
            if (isMatch)
                return true;
        }
        catch (error) {
            console.error('error finding match', error);
        }
    }

    return false;
}

export function fuzzyMatch(stringA: string, stringB: string, threshold = 0.5, maxLengthDifference = 0.3) : boolean {
    // Handle empty strings
    if (!stringA || !stringB) return false;

    // Simple equality check (optimization)
    if (stringA.toLowerCase() === stringB.toLowerCase()) {
        return true;
    }

    // First check the length difference
    const lengthA = stringA.length;
    const lengthB = stringB.length;
    const maxLength = Math.max(lengthA, lengthB);
    const minLength = Math.min(lengthA, lengthB);

    // Calculate the length difference ratio
    const lengthDifferenceRatio = (maxLength - minLength) / maxLength;

    // If the length difference is too large, consider it a non-match
    // This helps distinguish between full string matching and substring matching
    if (lengthDifferenceRatio > maxLengthDifference) {
        console.log(`Length difference too large: ${lengthDifferenceRatio.toFixed(2)} > ${maxLengthDifference}`);
        return false;
    }

    // Create a list containing the second string
    const list = [{ name: stringB }];

    // Configure Fuse
    const options = {
        includeScore: true,   // Return the score
        keys: ['name'],       // The property to search in
        threshold: threshold,  // Set threshold
        // By default, Fuse.js uses 0 for perfect match and 1 is no match (weird!!)
    };

    const fuse = new Fuse(list, options);

    // Search for the first string
    const result = fuse.search(stringA);

    // If we have a match and its score is below our threshold, consider it a match
    if (result.length > 0) {
        if (result[0].score) {
            return result[0].score <= threshold;
        }
        else {
            return false;
        }
    }

    return false;
}