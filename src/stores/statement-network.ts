import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
} from "@xyflow/react";
import {
  ConflictingEdge,
  connectionMarkerEnd,
  DrivenConnectionEdge,
  INASEdge,
  isConflictingEdge,
  isDrivenConnectionEdge,
} from "../lib/edge";
import { StatementNode } from "../lib/node";
import { createStore } from "zustand";
import { store as globalStore } from "./global";
import { Conflict, Connection, Statement } from "../lib/schema";
import { connection2id } from "@/lib/connection2id";
import { statementLabel } from "@/lib/utils";

export type State = {
  nodes: StatementNode[];
  edges: INASEdge[];
};

export type Action = {
  onNodesChange: OnNodesChange<StatementNode>;
  onEdgesChange: OnEdgesChange<INASEdge>;
  onConnect: OnConnect;
  setNodes: (nodes: StatementNode[]) => void;
  setEdges: (edges: INASEdge[]) => void;
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

const NODE_OFFSET = 60;

function onStatementsChange(statements: Statement[]) {
  const nodes = store.getState().nodes;
  let y = Math.max(...nodes.map((node) => node.position.y), 0);
  const nodesIds = new Map(nodes.map((node) => [node.id, node]));
  // statement graph has node vs statement in 1:1 relationship
  // so we can use statement id as node id
  // and if a statement is removed then the corresponding is also removed
  // by not including it in the new nodes array
  const newNodes: StatementNode[] = [];
  for (const statement of statements) {
    const foundNode = nodesIds.get(statement.Id);
    const label = statementLabel(statement);
    if (foundNode) {
      // updated
      const node = { ...foundNode };
      node.data = {
        raw: statement,
        label,
      };
      newNodes.push(node);
    } else {
      // new
      y += NODE_OFFSET;
      const statementNode: StatementNode = {
        id: statement.Id,
        type: "statement",
        data: {
          raw: statement,
          label,
        },
        position: { x: 0, y },
      };
      newNodes.push(statementNode);
    }
  }
  store.getState().setNodes([...newNodes]);
}

function onConnectionsChange(connections: Connection[]) {
  // The statement graph has 2 types of edges:
  // - conflict edges -> pass through unchanged
  // - driven connection edges
  const conflictEdges = store.getState().edges.filter(isConflictingEdge);
  const edgeIds = new Map(
    store
      .getState()
      .edges.filter(isDrivenConnectionEdge)
      .map((edge) => [edge.id, edge]),
  );
  const newEdges: INASEdge[] = [];
  for (const connection of connections) {
    const id = connection2id(connection);
    const foundEdge = edgeIds.get(id);
    if (foundEdge) {
      // updated
      const edge = { ...foundEdge };
      edge.source = connection.source_statement;
      edge.target = connection.target_statement;
      newEdges.push(edge);
    } else {
      // new
      const type = connection.driven_by;
      const edge: DrivenConnectionEdge = {
        id,
        source: connection.source_statement,
        target: connection.target_statement,
        sourceHandle: type,
        targetHandle: type,
        type,
        markerEnd: connectionMarkerEnd(type),
      };
      newEdges.push(edge);
    }
  }
  store.getState().setEdges([...conflictEdges, ...newEdges]);
}

function onConflictsChange(conflicts: Conflict[]) {
  const connectionEdges = store.getState().edges.filter(isDrivenConnectionEdge);
  const conflictIds = new Set(
    conflicts.map(
      (conflict) => `conflict-${conflict.formal}-${conflict.informal}`,
    ),
  );
  const unchangedConflictEdges = store
    .getState()
    .edges.filter((e) => isConflictingEdge(e) && conflictIds.has(e.id));
  const unchangedConflictEdgesIds = new Set(
    unchangedConflictEdges.map((edge) => edge.id),
  );

  const newEdges: ConflictingEdge[] = conflicts
    .filter(
      (c) =>
        !unchangedConflictEdgesIds.has(`conflict-${c.formal}-${c.informal}`),
    )
    .map((conflict) => {
      const e: ConflictingEdge = {
        id: `conflict-${conflict.formal}-${conflict.informal}`,
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
    .setEdges([...unchangedConflictEdges, ...newEdges, ...connectionEdges]);
}

globalStore.subscribe((state) => state.statements, onStatementsChange);
globalStore.subscribe((state) => state.connections, onConnectionsChange);
globalStore.subscribe((state) => state.conflicts, onConflictsChange);
