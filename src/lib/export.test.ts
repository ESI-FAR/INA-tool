import { INANode, StatementNode } from "./node";
import { Connection, Statement } from "./schema";
import {
  exportComponentNetworkToGEXF,
  exportComponentNetworkToGraphml,
  exportStatementNetworkToGraphml,
} from "./export";
import { describe, expect, test } from "vitest";
import { INACEdge, INASEdge } from "./edge";
import {
  applyConnectionsChanges,
  applyStatementsChanges,
} from "@/stores/component-network";

describe("exportStatementNetworkToGraphml", () => {
  test("single minimal node", async () => {
    const projectName = "single-node";
    const statement: Statement = {
      Id: "1",
      "Statement Type": "formal",
      Aim: "Aim1",
      Attribute: "Attribute1",
      Deontic: "",
    };
    const nodes: StatementNode[] = [
      {
        id: "1",
        type: "statement",
        data: {
          raw: statement,
          label: "F1",
        },
        position: { x: 10, y: 20 },
      },
    ];
    const edges: INASEdge[] = [];

    const file = exportStatementNetworkToGraphml(projectName, nodes, edges);

    expect(file.name).toEqual("single-node.statements.graphml");
    expect(file.type).toEqual("application/xml");
    const content = await file.text();
    expect(content).toContain("Attribute1");
    // TODO check file content more thoroughly
  });

  test("single maximum node", async () => {
    const projectName = "single-node";
    const statement: Statement = {
      Id: "1",
      "Statement Type": "formal",
      Aim: "Aim1",
      Attribute: "Attribute1",
      Deontic: "must",
      "Activation Condition": "Activation1",
      "Direct Object": "Direct1",
      "Type of Direct Object": "animate",
      "Indirect Object": "Indirect1",
      "Type of Indirect Object": "inanimate",
      "Execution Constraint": "Constraint1",
      "Or Else": "Else1",
    };
    const nodes: StatementNode[] = [
      {
        id: "1",
        type: "statement",
        data: {
          raw: statement,
          label: "F1",
        },
        position: { x: 10, y: 20 },
      },
    ];
    const edges: INASEdge[] = [];

    const file = exportStatementNetworkToGraphml(projectName, nodes, edges);

    expect(file.name).toEqual("single-node.statements.graphml");
    expect(file.type).toEqual("application/xml");
    const content = await file.text();
    expect(content).toContain("Constraint1");
    // TODO check file content more thoroughly
  });

  test("2 nodes, 1 edge", async () => {
    const projectName = "single-edge";
    const nodes: StatementNode[] = [
      {
        id: "1",
        type: "statement",
        data: {
          raw: {
            Id: "1",
            "Statement Type": "formal",
            Aim: "Aim1",
            Attribute: "Attribute1",
            Deontic: "",
          },
          label: "F1",
        },
        position: { x: 10, y: 20 },
      },
      {
        id: "2",
        type: "statement",
        data: {
          raw: {
            Id: "2",
            "Statement Type": "informal",
            Aim: "Aim2",
            Attribute: "Attribute2",
            Deontic: "",
          },
          label: "I2",
        },
        position: { x: 10, y: 40 },
      },
    ];
    const edges: INASEdge[] = [
      {
        id: "1-2",
        source: "1",
        target: "2",
        type: "actor",
      },
    ];

    const file = exportStatementNetworkToGraphml(projectName, nodes, edges);

    expect(file.name).toEqual("single-edge.statements.graphml");
    expect(file.type).toEqual("application/xml");
    const content = await file.text();
    expect(content).toContain("1-2");
    expect(content).toContain("actor");
  });
});

function exampleComponentNetwork(): [INANode[], INACEdge[]] {
  const statement1: Statement = {
    Id: "1",
    "Statement Type": "formal",
    Aim: "Aim1",
    Attribute: "Attribute1",
    Deontic: "",
  };
  const statement2: Statement = {
    Id: "2",
    "Statement Type": "informal",
    Aim: "Aim2",
    Attribute: "Attribute2",
    Deontic: "must",
    "Activation Condition": "Activation2",
  };
  const connection1: Connection = {
    source_statement: "1",
    source_component: "Aim",
    target_statement: "2",
    target_component: "Attribute",
    driven_by: "sanction",
  };
  const [nodes, statementEdges] = applyStatementsChanges(
    [statement1, statement2],
    [],
    [],
  );
  const edges = applyConnectionsChanges([connection1], statementEdges);
  return [nodes, edges];
}

describe("exportComponentNetworkToGraphml", () => {
  test("2 statements with 1 connections", async () => {
    const [nodes, edges] = exampleComponentNetwork();

    const file = exportComponentNetworkToGraphml(
      "2-statements-1-connection",
      nodes,
      edges,
    );

    expect(file.name).toEqual("2-statements-1-connection.components.graphml");
    expect(file.type).toEqual("application/xml");
    const content = await file.text();
    expect(content).toContain("Attribute1");
    expect(content).toContain("must");
    expect(content).toContain(
      "sanction-1-Aim-2-1-Attribute-1-Aim-2-2-Attribute",
    );
  });
});

describe("exportComponentNetworkToGEXF()", () => {
  test("2 statements with 1 connections", async () => {
    const [nodes, edges] = exampleComponentNetwork();

    const file = exportComponentNetworkToGEXF(
      "2-statements-1-connection",
      nodes,
      edges,
    );

    expect(file.name).toEqual("2-statements-1-connection.components.gexf");
    expect(file.type).toEqual("application/xml");
    const content = await file.text();
    expect(content).toContain("Attribute1");
    expect(content).toContain("must");
    expect(content).toContain(
      "sanction-1-Aim-2-1-Attribute-1-Aim-2-2-Attribute",
    );
  });
});
