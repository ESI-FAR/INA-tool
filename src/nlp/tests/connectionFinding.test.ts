import { describe, expect, test } from "vitest";
import { findConnectionsByType } from "@/nlp/connectionFinding";
import { preloadWordNetForStatements } from "@/nlp/fuzzyStringComparison";
import { mockStatements } from "@/nlp/testdata/testData";

// Preload WordNet before running tests
if (mockStatements) {
  await preloadWordNetForStatements(mockStatements);
}

describe("findConnections", () => {
  test("actor-driven connections", async () => {
    if (mockStatements) {
      const result = await findConnectionsByType(mockStatements, "action");
      const expectedConnections = [
        {
          driven_by: "actor",
          source_component: "Direct Object",
          source_statement: "6",
          target_component: "Attribute",
          target_statement: "12",
        },
        {
          driven_by: "actor",
          source_component: "Direct Object",
          source_statement: "7",
          target_component: "Attribute",
          target_statement: "8",
        },
        {
          driven_by: "actor",
          source_component: "Indirect Object",
          source_statement: "10",
          target_component: "Attribute",
          target_statement: "11",
        },
      ];

      expect(result).toEqual(expect.arrayContaining(expectedConnections));
      expect(expectedConnections).toEqual(expect.arrayContaining(result));
      expect(result.length).toBe(expectedConnections.length);
    }
  }, 100000);

  test("outcome-driven connections", async () => {
    if (mockStatements) {
      const result = await findConnectionsByType(mockStatements, "outcome");
      const expectedConnections = [
        {
          driven_by: "outcome",
          source_component: "Direct Object",
          source_statement: "13",
          target_component: "Activation Condition",
          target_statement: "14",
        },
        {
          driven_by: "outcome",
          source_component: "Execution Constraint",
          source_statement: "16",
          target_component: "Activation Condition",
          target_statement: "17",
        },
        {
          driven_by: "outcome",
          source_component: "Direct Object",
          source_statement: "15",
          target_component: "Activation Condition",
          target_statement: "18",
        },
      ];

      expect(result).toEqual(expect.arrayContaining(expectedConnections));
      expect(expectedConnections).toEqual(expect.arrayContaining(result));
      expect(result.length).toBe(expectedConnections.length);
    }
  }, 100000);

  test("sanction-driven connections", async () => {
    if (mockStatements) {
      const result = await findConnectionsByType(mockStatements, "sanction");
      const expectedConnections = [
        {
          driven_by: "sanction",
          source_component: "Aim",
          source_statement: "1",
          target_component: "Activation Condition",
          target_statement: "2",
        },
      ];

      expect(result).toEqual(expect.arrayContaining(expectedConnections));
      expect(expectedConnections).toEqual(expect.arrayContaining(result));
      expect(result.length).toBe(expectedConnections.length);
    }
  }, 200000);
});
