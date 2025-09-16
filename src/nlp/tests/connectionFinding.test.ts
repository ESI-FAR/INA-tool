import { describe, expect, test } from "vitest";
import { findConnectionsByType } from "@/nlp/connectionFinding";
import { preloadWordNetForStatements } from "@/nlp/fuzzyStringComparison";
import {
  statements,
  actorConnections,
  outcomeConnections,
} from "@/nlp/testdata/mitigationTestData";

// Preload WordNet before running tests
if (statements) {
  await preloadWordNetForStatements(statements);
}

describe("findConnections", () => {
  test("actor-driven connections", async () => {
    if (statements) {
      const result = await findConnectionsByType(statements, "action");
      result.forEach((connection) => {
        delete connection.matched_items;
      });
      expect(result).toEqual(expect.arrayContaining(actorConnections));
      expect(actorConnections).toEqual(expect.arrayContaining(result));
      expect(result.length).toBe(actorConnections.length);
    }
  }, 100000);

  test("outcome-driven connections", async () => {
    if (statements) {
      const result = await findConnectionsByType(statements, "outcome");
      result.forEach((connection) => {
        delete connection.matched_items;
      });
      expect(result).toEqual(expect.arrayContaining(outcomeConnections));
      expect(outcomeConnections).toEqual(expect.arrayContaining(result));
      expect(result.length).toBe(outcomeConnections.length);
    }
  }, 100000);
});
