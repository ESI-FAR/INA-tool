import {
  ActivationConditionNode,
  AimNode,
  AttributeNode,
  DirectObjectNode,
  ExecutionConstraintNode,
  INANode,
  InDirectObjectNode,
  StatementNode,
} from "@/components/nodes";
import { Connection, Statement } from "./schema";
import { store } from "./store";
import {
  InnerStatementEdge,
  INAEdge,
  DrivenConnection,
} from "@/components/edges";

export const DEFAULT_STATEMENT_HEIGHT = 140;

export function procesStatement(
  statement: Statement,
  fallBackId: string,
): [INANode[], InnerStatementEdge[]] {
  const nodes: INANode[] = [];
  const edges: InnerStatementEdge[] = [];
  const id = statement.Id || fallBackId;
  const statementNode: StatementNode = {
    id,
    type: "statement",
    data: { raw: statement, label: id, formalism: statement["Statement Type"] },
    position: { x: 0, y: 0 },
    style: {
      // TODO make smaller based on content
      width: 1200,
      height: DEFAULT_STATEMENT_HEIGHT,
    },
  };
  nodes.push(statementNode);

  const attributeId = `${id}-attribute`;
  const attributeNode: AttributeNode = {
    id: attributeId,
    type: "attribute",
    data: { label: statement.Attribute },
    // TODO move right if left node has lots of text
    position: { x: 300, y: 30 },
    parentId: id,
    extent: "parent",
  };
  nodes.push(attributeNode);

  if (statement["Activation Condition"]) {
    const activationConditionId = `${id}-activation-condition`;
    const activationConditionNode: ActivationConditionNode = {
      id: activationConditionId,
      type: "activation-condition",
      data: { label: statement["Activation Condition"] },
      position: { x: 10, y: 30 },
      parentId: id,
      extent: "parent",
    };
    nodes.push(activationConditionNode);
    const activationConditionEdge: InnerStatementEdge = {
      id: `${id}-activation-condition-2-attribute`,
      source: activationConditionId,
      target: attributeId,
      sourceHandle: "statement",
      targetHandle: "statement",
      type: "inner-statement",
    };
    edges.push(activationConditionEdge);
  }

  const aimId = `${id}-aim`;
  const aimNode: AimNode = {
    id: aimId,
    type: "aim",
    data: { label: statement.Aim },
    position: { x: 480, y: 30 },
    parentId: id,
    extent: "parent",
  };
  nodes.push(aimNode);
  const aimEdge: InnerStatementEdge = {
    id: `${id}-attribute-2-aim`,
    source: attributeId,
    target: aimId,
    label: statement.Deontic,
    sourceHandle: "statement",
    targetHandle: "statement",
    type: "inner-statement",
  };
  edges.push(aimEdge);

  if (statement["Direct Object"]) {
    const directObjectId = `${id}-direct-object`;
    const directObjectNode: DirectObjectNode = {
      id: directObjectId,
      type: "direct-object",
      data: {
        label: statement["Direct Object"],
        animation: statement["Type of Direct Object"],
      },
      position: { x: 715, y: 30 },
      parentId: id,
      extent: "parent",
    };
    nodes.push(directObjectNode);
    edges.push({
      id: `${id}-aim-2-direct-object`,
      source: aimId,
      target: directObjectId,
      sourceHandle: "direct-object",
      targetHandle: "statement",
      type: "inner-statement",
    });

    if (statement["Indirect Object"]) {
      const indirectObjectId = `${id}-indirect-object`;
      const indirectObjectNode: InDirectObjectNode = {
        id: indirectObjectId,
        data: {
          label: statement["Indirect Object"],
          animation: statement["Type of Indirect Object"],
        },
        type: "indirect-object",
        position: { x: 715, y: 80 },
        parentId: id,
        extent: "parent",
      };
      nodes.push(indirectObjectNode);
      edges.push({
        id: `${id}-direct-object-2-indirect-object`,
        source: directObjectId,
        target: indirectObjectId,
        sourceHandle: "statement",
        targetHandle: "statement",
        type: "inner-statement",
      });
    }

    if (statement["Execution Constraint"]) {
      const executionConstraintId = `${id}-execution-constraint`;
      const executionConstraintNode: ExecutionConstraintNode = {
        id: executionConstraintId,
        type: "execution-constraint",
        data: { label: statement["Execution Constraint"] },
        position: { x: 430, y: 80 },
        parentId: id,
        extent: "parent",
      };
      nodes.push(executionConstraintNode);
      // aim 2 execution constraint edge
      edges.push({
        id: `${id}-aim-2-execution-constraint`,
        source: aimId,
        target: executionConstraintId,
        sourceHandle: "execution-constraint",
        targetHandle: "statement",
        type: "inner-statement",
      });
    }
  }

  // TODO how to render 'Or Else'?

  return [nodes, edges];
}

function isStatementNode(node: INANode): node is StatementNode {
  return node.type === "statement";
}

export function deriveStatements(nodes: INANode[]): Statement[] {
  return nodes.filter(isStatementNode).map((node) => node.data.raw);
}

function isDrivenConnection(edge: INAEdge): edge is DrivenConnection {
  return (
    edge.type === "actor-driven" ||
    edge.type === "outcome-driven" ||
    edge.type === "sanction-driven"
  );
}

export function deriveConnections(edges: INAEdge[]): DrivenConnection[] {
  return edges.filter(isDrivenConnection);
}

function processConnection(
  connection: Connection,
  nodes: INANode[],
): DrivenConnection {
  const sourceStatement = nodes.find(
    (node) => node.type === "statement" && node.id === connection.source_node,
  );
  const targetStatement = nodes.find(
    (node) => node.type === "statement" && node.id === connection.target_node,
  );
  if (!sourceStatement || !targetStatement) {
    throw new Error("Source or target statement not found");
  }
  const sourceNode = nodes.find(
    (node) =>
      node.parentId === sourceStatement.id &&
      node.type === connection.source_node,
  );
  const targetNode = nodes.find(
    (node) =>
      node.parentId === targetStatement.id &&
      node.type === connection.target_node,
  );
  if (!sourceNode || !targetNode) {
    throw new Error("Source or target node not found");
  }
  switch (connection.driver) {
    case "actor":
      return {
        id: `${sourceNode.id}-2-${targetNode.id}`,
        source: sourceNode.id,
        target: targetNode.id,
        type: "actor-driven",
      };
    case "outcome":
      return {
        id: `${sourceNode.id}-2-${targetNode.id}`,
        source: sourceNode.id,
        target: targetNode.id,
        type: "outcome-driven",
      };
    case "sanction":
      return {
        id: `${sourceNode.id}-2-${targetNode.id}`,
        source: sourceNode.id,
        target: targetNode.id,
        type: "sanction-driven",
      };
    default:
      throw new Error("Unknown driver");
  }
}

function offsetStatements(nodes: INANode[]) {
  const gap = 10;
  nodes.filter(isStatementNode).forEach((statement, index) => {
    statement.position.y = index * DEFAULT_STATEMENT_HEIGHT + index * gap;
  });
}

export function load(statements: Statement[], connections: Connection[]) {
  const nodes: INANode[] = [];
  const edges: INAEdge[] = [];
  let id = 1;
  for (const statement of statements) {
    const [newNodes, newEdges] = procesStatement(statement, id.toString());
    nodes.push(...newNodes);
    edges.push(...newEdges);
    id++;
  }
  offsetStatements(nodes);

  for (const connection of connections) {
    const newEdge = processConnection(connection, nodes);
    edges.push(newEdge);
  }
  store.getState().setNodes(nodes);
  store.getState().setEdges(edges);
}

export function save(): {
  statements: Statement[];
  connections: DrivenConnection[];
} {
  const statements = deriveStatements(store.getState().nodes);
  const connections = deriveConnections(store.getState().edges);
  return { statements, connections };
}

export function download(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}
