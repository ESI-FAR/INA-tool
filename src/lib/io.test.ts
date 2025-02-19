import { test, expect, describe } from "vitest";
import { procesStatement } from "./io";
import { Statement } from "./schema";

describe("procesStatement", () => {
  describe("on empty store", () => {
    test("direct", () => {
      const statement: Statement = {
        "Statement Type": "formal",
        Attribute: "VROMI minister",
        Deontic: "must",
        Aim: "order",
        "Direct Object": "infrastructure dept to execute clean-up",
        "Indirect Object": "",
        "Activation Condition": "if necessary after a storm event",
        "Execution Constraint": "",
        "Or Else": "",
      };

      const [nodes, edges] = procesStatement(statement, "1");

      expect(nodes.length).toEqual(5);
      expect(edges.length).toEqual(3);
    });
  });
});
