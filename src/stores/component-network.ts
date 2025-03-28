import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
} from "@xyflow/react";
import {
  builderDrivenConnectionEdge,
  INACEdge,
  ComponentEdge,
  isDrivenConnectionEdge,
  isComponentEdge,
  isConflictingEdge,
  ConflictingEdge,
} from "../lib/edge";
import {
  INANode,
  isComponentNode,
  isStatementNode,
  StatementNode,
  StatementRelatedNode,
} from "../lib/node";
import { createStore } from "zustand";
import { store as globalStore } from "./global";
import { Conflict, Connection, Statement } from "../lib/schema";
import { DEFAULT_STATEMENT_HEIGHT, procesStatement } from "../lib/io";
import { connection2id } from "../lib/connection2id";

export type State = {
  nodes: INANode[];
  edges: INACEdge[];
};

export type Action = {
  onNodesChange: OnNodesChange<INANode>;
  onEdgesChange: OnEdgesChange<INACEdge>;
  onConnect: OnConnect;
  setNodes: (nodes: INANode[]) => void;
  setEdges: (edges: INACEdge[]) => void;
};

export type Store = State & Action;

export const store = createStore<Store>((set, get) => ({
  nodes: [],
  edges: [],
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  setNodes: (nodes) => {
    set({ nodes });
  },
  setEdges: (edges) => {
    set({ edges });
  },
}));

function compareStatement(a: Statement, b: Statement): boolean {
  return (
    a.Id === b.Id &&
    a.Attribute === b.Attribute &&
    a.Aim === b.Aim &&
    a["Statement Type"] === b["Statement Type"] &&
    a.Deontic === b.Deontic &&
    a["Direct Object"] === b["Direct Object"] &&
    a["Type of Direct Object"] === b["Type of Direct Object"] &&
    a["Indirect Object"] === b["Indirect Object"] &&
    a["Type of Indirect Object"] === b["Type of Indirect Object"] &&
    a["Activation Condition"] === b["Activation Condition"] &&
    a["Execution Constraint"] === b["Execution Constraint"] &&
    a["Or Else"] === b["Or Else"]
  );
}

export function applyStatementsChanges(
  statements: Statement[],
  nodes: INANode[],
  edges: INACEdge[],
): [INANode[], INACEdge[]] {
  const conflictEdges = store.getState().edges.filter(isConflictingEdge);
  const drivenConnectionEdges = edges.filter(isDrivenConnectionEdge);
  const nodeLookup = new Map<string, StatementRelatedNode>(
    nodes
      .filter((n) => isStatementNode(n) || isComponentNode(n))
      .map((n) => [n.id, n]),
  );
  const statementNodeLookup = new Map<string, StatementNode>(
    nodes.filter(isStatementNode).map((n) => [n.id, n]),
  );
  const newNodes: StatementRelatedNode[] = [];
  const newEdges: ComponentEdge[] = [];
  for (const statement of statements) {
    if (statementNodeLookup.has(statement.Id)) {
      // Possible updated statement
      const statementNode = statementNodeLookup.get(statement.Id)!;
      if (compareStatement(statement, statementNode.data.raw)) {
        // Same statement, no need to update
        // retain statement node, component nodes and edges
        newNodes.push(statementNode);
        const myComponentNodes = nodes
          .filter(isComponentNode)
          .filter((n) => n.parentId === statement.Id);
        newNodes.push(...myComponentNodes);
        const myComponentEdges = edges
          .filter(isComponentEdge)
          .filter((e) => e.data?.statementId === statement.Id);
        newEdges.push(...myComponentEdges);
      } else {
        // Updated statement
        // update statement node, component nodes and edges
        // but retain position, dimensions and other ReactFlow specific data
        const [myNewNodes, myNewEdges] = procesStatement(
          statement,
          statement.Id,
        );
        const myNewMergedNodes = myNewNodes.map((n) => {
          const oldNode = nodeLookup.get(n.id);
          if (!oldNode) {
            return n;
          }
          return {
            ...n,
            position: oldNode.position,
            style: oldNode.style,
          };
        });
        newNodes.push(...myNewMergedNodes);
        newEdges.push(...myNewEdges);
      }
    } else {
      // New statement
      // create statement node, component nodes, component edges
      const [myNewNodes, myNewEdges] = procesStatement(statement, statement.Id);

      // offset statement node position, to be below last statement node
      const maxY = Math.max(
        ...Array.from(statementNodeLookup.values()).map((n) => n.position.y),
        0,
      );
      // TODO use height of node with maxY instead of DEFAULT_STATEMENT_HEIGHT
      myNewNodes[0].position.y = maxY + DEFAULT_STATEMENT_HEIGHT + 10;
      statementNodeLookup.set(statement.Id, myNewNodes[0] as StatementNode);

      newNodes.push(...myNewNodes);
      newEdges.push(...myNewEdges);
    }
  }
  return [newNodes, [...conflictEdges, ...drivenConnectionEdges, ...newEdges]];
}

function onStatementsChange(statements: Statement[]) {
  const [nodes, edges] = applyStatementsChanges(
    statements,
    store.getState().nodes,
    store.getState().edges,
  );
  store.getState().setNodes(nodes);
  store.getState().setEdges(edges);
}

export function applyConnectionsChanges(
  connections: Connection[],
  edges: INACEdge[],
): INACEdge[] {
  const connectionIds = new Set(connections.map(connection2id));

  // find connection that are already edges, no need to update them
  // as id captures all the information
  const drivenConnectionEdges = edges
    .filter(isDrivenConnectionEdge)
    .filter((edge) => connectionIds.has(edge.id));

  // find connections that are not yet edges and add them
  const edgeIds = new Set(drivenConnectionEdges.map((edge) => edge.id));
  for (const connection of connections) {
    const id = connection2id(connection);
    if (!edgeIds.has(id)) {
      // new edge
      const newEdge = builderDrivenConnectionEdge(
        id,
        connection.source_statement + "-" + connection.source_component,
        connection.target_statement + "-" + connection.target_component,
        connection.driven_by,
      );
      drivenConnectionEdges.push(newEdge);
    }
  }
  const otherEdges = edges.filter((edge) => !isDrivenConnectionEdge(edge));
  return [...otherEdges, ...drivenConnectionEdges];
}

function onConnectionsChange(connections: Connection[]) {
  const edges = applyConnectionsChanges(connections, store.getState().edges);
  store.getState().setEdges(edges);
}

export function conflict2id(conflict: Conflict): string {
  return `conflict-${conflict.formal}-${conflict.informal}`;
}

function onConflictsChange(conflicts: Conflict[]) {
  const nonConflictEdges = store
    .getState()
    .edges.filter((e) => !isConflictingEdge(e));
  const conflictIds = new Set(conflicts.map(conflict2id));
  const unchangedConflictEdges = store
    .getState()
    .edges.filter((e) => isConflictingEdge(e) && conflictIds.has(e.id));
  const unchangedConflictEdgesIds = new Set(
    unchangedConflictEdges.map((edge) => edge.id),
  );

  const newEdges: ConflictingEdge[] = conflicts
    .filter((c) => !unchangedConflictEdgesIds.has(conflict2id(c)))
    .map((conflict) => {
      const e: ConflictingEdge = {
        id: conflict2id(conflict),
        source: conflict.formal,
        target: conflict.informal,
        sourceHandle: "conflict",
        targetHandle: "conflict",
        type: "conflict",
      };
      return e;
    });

  store
    .getState()
    .setEdges([...unchangedConflictEdges, ...newEdges, ...nonConflictEdges]);
}

globalStore.subscribe((state) => state.statements, onStatementsChange);
globalStore.subscribe((state) => state.connections, onConnectionsChange);
globalStore.subscribe((state) => state.conflicts, onConflictsChange);
