import { createStore } from "zustand";

import {
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import { INANode } from "./node";
import { INAEdge } from "./edge";
import { compacter } from "./compacter";

export type State = {
  projectName: string;
  nodes: INANode[];
  edges: INAEdge[];
  isCompact: boolean;
};

export type Action = {
  onNodesChange: OnNodesChange<INANode>;
  onEdgesChange: OnEdgesChange<INAEdge>;
  onConnect: OnConnect;
  setNodes: (nodes: INANode[]) => void;
  setEdges: (edges: INAEdge[]) => void;
  setProjectName: (projectName: string) => void;
  setCompact: (isCompact: boolean) => void;
};

export type Store = State & Action;

export const store = createStore<Store>((set, get) => ({
  projectName:
    // Initialize project name from URL query parameter
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("project") || ""
      : "",
  nodes: [],
  edges: [],
  isCompact: false,
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
  setCompact: (isCompact) => {
    const { nodes, edges } = compacter(isCompact, get().nodes, get().edges);
    set({
      isCompact,
      nodes,
      edges,
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
    const { nodes, edges, isCompact } = JSON.parse(savedData);
    store.setState({ nodes, edges, isCompact });
  }

  const saveState = () => {
    const state = store.getState();
    if (!state.nodes) {
      return;
    }
    const dataToSave = {
      nodes: state.nodes,
      edges: state.edges,
      isCompact: state.isCompact,
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
