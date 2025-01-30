import { createStore } from "zustand";

import {
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  XYPosition,
  Dimensions,
  Viewport,
  NodeChange,
  NodeDimensionChange,
  NodePositionChange,
} from "@xyflow/react";
import { INANode } from "@/components/nodes";
import { INAEdge } from "@/components/edges";
import { Connection, Statement, Statements } from "./schema";
import { isInnerStatementNode, isStatementNode } from "./io";

type InnerNodeTypes =
  | "attribute"
  | "aim"
  | "direct-object"
  | "indirect-object"
  | "activation-condition"
  | "execution-constraint"
  | "or-else";

export interface StatementLayout {
  id: string;
  position: XYPosition;
  /**
   * In react flow node this is read from node.measured
   * and set in node.style.width and node.style.height
   */
  width: number | string;
  height: number | string;
  inner: Record<InnerNodeTypes, XYPosition>;
}

export type State = {
  projectName: string;
  nodes: INANode[];
  edges: INAEdge[];
  connections: Connection[];
  statements: Statement[];
  layout: {
    statements: StatementLayout[];
    viewport: Viewport;
  };
};

export type Action = {
  onNodesChange: OnNodesChange<INANode>;
  onEdgesChange: OnEdgesChange<INAEdge>;
  onConnect: OnConnect;
  setNodes: (nodes: INANode[]) => void;
  setEdges: (edges: INAEdge[]) => void;
  setProjectName: (projectName: string) => void;
  setStatements: (statements: Statement[]) => void;
  setConections: (connections: Connection[]) => void;
  setViewport: (viewport: Viewport) => void;
  setLayoutStatements: (layout: StatementLayout[]) => void;
};

export type Store = State & Action;

function isNodeDimensionChange(
  change: NodeChange<INANode>,
): change is NodeDimensionChange {
  return change.type === "dimensions" && !change.resizing;
}

function isNodePositionChange(
  change: NodeChange<INANode>,
): change is NodePositionChange {
  return change.type === "position" && !change.dragging;
}

function deriveLayout(
  changes: NodeChange<INANode>[],
  statements: StatementLayout[],
  nodes: INANode[],
) {
  const filteredChanges = changes.filter(
    (change) => isNodeDimensionChange(change) || isNodePositionChange(change),
  );
  if (filteredChanges.length !== 1) {
    return statements;
  }
  // TODO LayoutButton should trigger multiple changes, handle all of those
  const change = filteredChanges[0];
  const node = nodes.find((n) => n.id === change.id);
  if (!node) {
    throw new Error(`Node with id ${change.id} not found`);
  }
  if (isInnerStatementNode(node)) {
    // Node is a inner node of a statement
    let statement = statements.find((s) => s.id === node.parentId);
    const statementNode = nodes.find((n) => n.id === node.parentId);
    if (
      statement === undefined &&
      statementNode &&
      statementNode.measured &&
      statementNode.measured.width &&
      statementNode.measured.height
    ) {
      statement = {
        id: change.id,
        position: statementNode.position,
        width: statementNode.measured.width,
        height: statementNode.measured.height,
        inner: {
          attribute: { x: 0, y: 0 },
          aim: { x: 0, y: 0 },
          "direct-object": { x: 0, y: 0 },
          "indirect-object": { x: 0, y: 0 },
          "activation-condition": { x: 0, y: 0 },
          "execution-constraint": { x: 0, y: 0 },
          "or-else": { x: 0, y: 0 },
        },
      };
      if (change.type === "position" && change.position) {
        statement.inner[node.type!] = change.position;
      }
    }
    if (statement && change.type === "position" && change.position) {
      statement.inner[node.type!] = change.position;
    }
  }

  let statement = statements.find((s) => s.id === change.id);
  if (!statement) {
    statement = {
      id: change.id,
      position: { x: 0, y: 0 },
      width: 0,
      height: 0,
      inner: {
        attribute: { x: 0, y: 0 },
        aim: { x: 0, y: 0 },
        "direct-object": { x: 0, y: 0 },
        "indirect-object": { x: 0, y: 0 },
        "activation-condition": { x: 0, y: 0 },
        "execution-constraint": { x: 0, y: 0 },
        "or-else": { x: 0, y: 0 },
      },
    };
    if (change.type === "position" && change.position) {
      statement.position = change.position;
    }
    if (change.type === "dimensions" && change.dimensions) {
      statement.width = change.dimensions.width;
      statement.height = change.dimensions.height;
    }
    return [...statements, statement];
  }
  if (change.type === "position" && change.position) {
    statement.position = change.position;
  }
  if (change.type === "dimensions" && change.dimensions) {
    statement.width = change.dimensions.width;
    statement.height = change.dimensions.height;
  }
  return statements.map((s) => (s.id === change.id ? { ...statement } : s));
}

export const store = createStore<Store>((set, get) => ({
  projectName:
    // Initialize project name from URL query parameter
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("project") || ""
      : "",
  nodes: [],
  edges: [],
  connections: [],
  statements: [],
  layout: {
    statements: [],
    viewport: {
      x: 0,
      y: 0,
      zoom: 1,
    },
  },
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
      layout: {
        ...get().layout,
        statements: deriveLayout(changes, get().layout.statements, get().nodes),
      },
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
  setProjectName: (projectName) => {
    const prevProjectName = get().projectName;
    if (prevProjectName === projectName) {
      return;
    }
    if (prevProjectName !== "" && prevProjectName !== projectName) {
      localStorage.removeItem(`ina-project-${prevProjectName}`);
    }
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("project", projectName);
      window.history.replaceState({}, "", `?${searchParams.toString()}`);
    }
    set({ projectName });
  },
  setStatements: (statements) => {
    set({ statements });
  },
  setConections: (connections) => {
    set({ connections });
  },
  setViewport: (viewport) => {
    set({
      layout: {
        ...get().layout,
        viewport,
      },
    });
  },
  setLayoutStatements: (layout) => {
    set({
      layout: {
        ...get().layout,
        statements: layout,
      },
    });
  },
}));

function setupStorePersistence() {
  // Skip if not in browser
  if (typeof window === "undefined") return;

  const projectName = store.getState().projectName;
  if (!projectName) return;

  // Load initial state from localStorage
  const savedData = localStorage.getItem(`ina-project-${projectName}`);

  if (savedData) {
    const { nodes, edges } = JSON.parse(savedData);
    store.setState({ nodes, edges });
  }

  const saveState = () => {
    const state = store.getState();
    if (!state.nodes) {
      return;
    }
    const dataToSave = {
      nodes: state.nodes,
      edges: state.edges,
    };
    localStorage.setItem(
      `ina-project-${state.projectName}`,
      JSON.stringify(dataToSave),
    );
  };

  // Save on tab close/visibility change
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      saveState();
    }
  });

  // Save on window close
  window.addEventListener("beforeunload", saveState);
}

setupStorePersistence();
