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

import { Connection, connectionSchema, Statement } from "./schema";
import { store } from "./store";
import {
  InnerStatementEdge,
  INAEdge,
  DrivenConnection,
  buildEdge,
} from "@/components/edges";

export const DEFAULT_STATEMENT_HEIGHT = 180;

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
    position: { x: 270, y: 30 },
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
        position: { x: 715, y: 100 },
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
  }
  if (statement["Execution Constraint"]) {
    const executionConstraintId = `${id}-execution-constraint`;
    const executionConstraintNode: ExecutionConstraintNode = {
      id: executionConstraintId,
      type: "execution-constraint",
      data: { label: statement["Execution Constraint"] },
      position: { x: 430, y: 100 },
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

  // TODO how to render 'Or Else'?

  return [nodes, edges];
}

export function isStatementNode(node: INANode): node is StatementNode {
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

function enrichEdge(
  edge: DrivenConnection,
  lookup: Map<string, INANode>,
): Connection {
  const sourceNode = lookup.get(edge.source);
  const targetNode = lookup.get(edge.target);
  if (
    !edge.type ||
    !sourceNode ||
    !targetNode ||
    !sourceNode.parentId ||
    !targetNode.parentId ||
    !sourceNode.type ||
    !targetNode.type
  ) {
    throw new Error("Source or target node not found");
  }
  return connectionSchema.parse({
    source_statement: sourceNode.parentId,
    source_node: sourceNode.type,
    source_value: sourceNode.data.label,
    target_statement: targetNode.parentId,
    target_node: targetNode.type,
    target_value: targetNode.data.label,
    driver: edge.type.replace("-driven", ""),
  });
}

export function deriveConnections(
  edges: INAEdge[],
  nodes: INANode[],
): Connection[] {
  const lookup = new Map<string, INANode>(nodes.map((node) => [node.id, node]));
  return edges
    .filter(isDrivenConnection)
    .map((e) => enrichEdge(e, lookup))
    .sort(
      (a, b) =>
        a.source_statement.localeCompare(b.source_statement) ||
        a.source_node.localeCompare(b.source_node) ||
        a.target_statement.localeCompare(b.target_statement) ||
        a.target_node.localeCompare(b.target_node),
    );
}

export class InvalidConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidConnectionError";
  }
}

function processConnection(
  connection: Connection,
  lookup: Map<string, INANode>,
): INAEdge {
  if (connection.source_statement === connection.target_statement) {
    throw new InvalidConnectionError(
      "Source and target statement can not be the same",
    );
  }
  const sourceStatement = lookup.get(connection.source_statement);
  if (!sourceStatement) {
    throw new InvalidConnectionError(
      `Source statement "${connection.source_statement}" not found`,
    );
  }
  const targetStatement = lookup.get(connection.target_statement);
  if (!targetStatement) {
    throw new InvalidConnectionError(
      `Target statement "${connection.target_statement}" not found`,
    );
  }
  const sourceNodeId = `${connection.source_statement}-${connection.source_node}`;
  const targetNodeId = `${connection.target_statement}-${connection.target_node}`;
  const sourceNode = lookup.get(sourceNodeId);
  const targetNode = lookup.get(targetNodeId);
  if (!sourceNode) {
    throw new InvalidConnectionError(`Source node "${sourceNodeId}" not found`);
  }
  if (!targetNode) {
    throw new InvalidConnectionError(`Target node "${targetNodeId}" not found`);
  }

  // TODO gather all errors instead of throwing on first one
  // TODO replace with zod somehow
  if (connection.driver === "actor") {
    if (targetNode.type !== "attribute") {
      throw new InvalidConnectionError(
        `Actor driven connection target can only be attribute, got "${targetNode.type}"`,
      );
    }
    const sourceIsAnimateObject =
      (sourceNode.type === "direct-object" ||
        sourceNode.type === "indirect-object") &&
      sourceNode.data.animation === "animate";
    const sourceIsExecutionConstraint =
      sourceNode.type === "execution-constraint";
    if (!sourceIsAnimateObject && !sourceIsExecutionConstraint) {
      throw new InvalidConnectionError(
        `Actor driven connection source can only be animate direct/indirect object or execution constraint, got "${sourceNode.type}"`,
      );
    }
    return buildEdge(sourceNode.id, targetNode.id, "actor-driven");
  } else if (connection.driver === "outcome") {
    if (targetNode.type !== "activation-condition") {
      throw new InvalidConnectionError(
        `Outcome driven connection target can only be activation condition, got "${targetNode.type}"`,
      );
    }
    const sourceIsInanimateObject =
      (sourceNode.type === "direct-object" ||
        sourceNode.type === "indirect-object") &&
      sourceNode.data.animation === "inanimate";
    if (!sourceIsInanimateObject) {
      throw new InvalidConnectionError(
        `Outcome driven connection source can only be inanimate direct/indirect object, got "${sourceNode.type}"`,
      );
    }
    return buildEdge(sourceNode.id, targetNode.id, "outcome-driven");
  } else if (connection.driver === "sanction") {
    if (targetNode.type !== "activation-condition") {
      throw new InvalidConnectionError(
        `Sanction driven connection target can only be activation condition, got "${targetNode.type}"`,
      );
    }
    if (sourceNode.type !== "aim") {
      throw new InvalidConnectionError(
        `Sanction driven connection source can only be aim, got "${sourceNode.type}"`,
      );
    }
    return buildEdge(sourceNode.id, targetNode.id, "sanction-driven");
  }
  throw new InvalidConnectionError(`Unknown driver "${connection.driver}"`);
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

  const lookup = new Map<string, INANode>(nodes.map((node) => [node.id, node]));
  for (const connection of connections) {
    const newEdge = processConnection(connection, lookup);
    edges.push(newEdge);
  }
  store.getState().setNodes(nodes);
  store.getState().setEdges(edges);
}

export function save(): {
  statements: Statement[];
  connections: Connection[];
} {
  const nodes = store.getState().nodes;
  const statements = deriveStatements(nodes);
  const connections = deriveConnections(store.getState().edges, nodes);
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

export function loadConnections(connections: Connection[]) {
  const nodes = store.getState().nodes;
  const edges = store.getState().edges;
  const lookup = new Map<string, INANode>(nodes.map((node) => [node.id, node]));
  // TODO gather up all errors instead of throwing first one
  const newEdges = connections.map((connection) =>
    processConnection(connection, lookup),
  );
  store.getState().setEdges([...edges, ...newEdges]);
}
