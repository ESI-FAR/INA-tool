import { describe, expect, test } from "vitest";
import { checkWordOccurrence } from "@/nlp/negationDetection";
import { negationData } from "@/nlp/testdata/testData";

describe("negationDetection", () => {
  test("true cases", async () => {
    if (negationData["true"]) {
      const result = [];
      const incorrect = [];
      for (let i = 0; i < negationData["true"].length; i++) {
        const res = await checkWordOccurrence(
          negationData["true"][i]["word"],
          true,
          negationData["true"][i]["sent"],
        );
        result.push(res);
        if (res === false) {
          incorrect.push(negationData["true"][i]);
        }
      }
      const expectedResult = new Array(negationData["true"].length).fill(true);

      // console.log('incorrect (should be true but found false): ', incorrect);

      expect(result).toEqual(expect.arrayContaining(expectedResult));
      expect(expectedResult).toEqual(expect.arrayContaining(result));
      expect(result.length).toBe(expectedResult.length);
    }
  }, 10000);

  test("false cases", async () => {
    if (negationData["false"]) {
      const result = [];
      const incorrect = [];
      for (let i = 0; i < negationData["false"].length; i++) {
        const res = await checkWordOccurrence(
          negationData["false"][i]["word"],
          false,
          negationData["false"][i]["sent"],
        );
        result.push(res);

        if (res === true) {
          incorrect.push(negationData["false"][i]);
        }
      }
      const expectedResult = new Array(negationData["false"].length).fill(
        false,
      );

      // console.log('incorrect (should be false but found true): ', incorrect);

      expect(result).toEqual(expect.arrayContaining(expectedResult));
      expect(expectedResult).toEqual(expect.arrayContaining(result));
      expect(result.length).toBe(expectedResult.length);
    }
  }, 10000);
});
