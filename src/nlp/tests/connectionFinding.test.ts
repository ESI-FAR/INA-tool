import { describe, expect, test } from "vitest";
import { findConnectionsByType } from "@/nlp/connectionFinding";
import { preloadWordNetForStatements } from "@/nlp/fuzzyStringComparison";
import { mockStatements, actorConnections, outcomeConnections, sanctionConnections } from "@/nlp/testdata/testData";

// Preload WordNet before running tests
if (mockStatements) {
  await preloadWordNetForStatements(mockStatements);
}

describe("findConnections", () => {
  test("actor-driven connections", async () => {
    if (mockStatements) {
      const result = await findConnectionsByType(mockStatements, "action");
      expect(result).toEqual(expect.arrayContaining(actorConnections));
      expect(actorConnections).toEqual(expect.arrayContaining(result));
      expect(result.length).toBe(actorConnections.length);
    }
  }, 100000);

  test("outcome-driven connections", async () => {
    if (mockStatements) {
      const result = await findConnectionsByType(mockStatements, "outcome");
      expect(result).toEqual(expect.arrayContaining(outcomeConnections));
      expect(outcomeConnections).toEqual(expect.arrayContaining(result));
      expect(result.length).toBe(outcomeConnections.length);
    }
  }, 100000);
});
