import { test, expect, describe } from "vitest";
import { procesStatement } from "./io";
import { Statement } from "./schema";

/*

[
  {
    "Statement Type": "formal",
    "Attribute": "VROMI minister",
    "Deontic": "must",
    "Aim": "order",
    "Direct Object": "infrastructure dept to execute clean-up",
    "Indirect Object": "",
    "Activation Condition": "if necessary after a storm event",
    "Execution Constraint": "",
    "Or Else": "",
    "Id": "1"
  },
  {
    "Statement Type": "informal",
    "Attribute": "Governor",
    "Deontic": "",
    "Aim": "requests",
    "Direct Object": "financial aid",
    "Indirect Object": "from Dutch Kingdom",
    "Activation Condition": "if requested by Prime minister",
    "Execution Constraint": "",
    "Or Else": "",
    "Id": "2"
  },
  {
    "Statement Type": "formal",
    "Attribute": "Property owners",
    "Deontic": "must",
    "Aim": "insure",
    "Direct Object": "their properties",
    "Indirect Object": "",
    "Activation Condition": "",
    "Execution Constraint": "",
    "Or Else": "",
    "Id": "3"
  },
  {
    "Statement Type": "informal",
    "Attribute": "NGOs",
    "Deontic": "",
    "Aim": "help",
    "Direct Object": "",
    "Indirect Object": "",
    "Activation Condition": "if requested by inhabitants",
    "Execution Constraint": "in reconstruction",
    "Or Else": "",
    "Id": "4"
  },
  {
    "Statement Type": "formal",
    "Attribute": "VROMI infrastructure dept.",
    "Deontic": "must",
    "Aim": "clean",
    "Direct Object": "gutters",
    "Indirect Object": "",
    "Activation Condition": "",
    "Execution Constraint": "before June (start hurricane season)",
    "Or Else": "",
    "Id": "5"
  },
  {
    "Statement Type": "formal",
    "Attribute": "ACER",
    "Deontic": "must",
    "Aim": "update",
    "Direct Object": "the recommendations",
    "Indirect Object": "",
    "Activation Condition": "",
    "Execution Constraint": "at least once every two years",
    "Or Else": "",
    "Id": "6"
  }
]
  */
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
