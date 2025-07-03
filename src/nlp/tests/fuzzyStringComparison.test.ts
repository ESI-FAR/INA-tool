import { describe, expect, test } from "vitest";
import { fuzzyIncludesOptimized } from "@/nlp/fuzzyStringComparison";
import { fuzzyMatchingData } from "@/nlp/testdata/testData";

describe("fuzzyStringComparison", () => {
  test("true cases", async () => {
    if (fuzzyMatchingData["true"]) {
      const result = [];
      const incorrect = [];
      for (let i = 0; i < fuzzyMatchingData["true"].length; i++) {
        const res = await fuzzyIncludesOptimized(
          fuzzyMatchingData["true"][i]["text1"],
          fuzzyMatchingData["true"][i]["text2"],
        );
        result.push(res.isMatch);
        if (res.isMatch === false) {
          incorrect.push(fuzzyMatchingData["true"][i]);
        }
      }
      const expectedResult = new Array(fuzzyMatchingData["true"].length).fill(
        true,
      );

      expect(result).toEqual(expect.arrayContaining(expectedResult));
      expect(expectedResult).toEqual(expect.arrayContaining(result));
      expect(result.length).toBe(expectedResult.length);
    }
  }, 10000);

  test("false cases", async () => {
    if (fuzzyMatchingData["false"]) {
      const result = [];
      const incorrect = [];
      for (let i = 0; i < fuzzyMatchingData["false"].length; i++) {
        const res = await fuzzyIncludesOptimized(
          fuzzyMatchingData["false"][i]["text1"],
          fuzzyMatchingData["false"][i]["text2"],
        );
        result.push(res.isMatch);

        if (res.isMatch === true) {
          incorrect.push(fuzzyMatchingData["false"][i]);
        }
      }
      const expectedResult = new Array(fuzzyMatchingData["false"].length).fill(
        false,
      );

      expect(result).toEqual(expect.arrayContaining(expectedResult));
      expect(expectedResult).toEqual(expect.arrayContaining(result));
      expect(result.length).toBe(expectedResult.length);
    }
  }, 10000);
});
