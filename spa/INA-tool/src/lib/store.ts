import { createStore } from "zustand";

import {
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import { INANode } from "@/components/nodes";
import { INAEdge } from "@/components/edges";

export type State = {
  projectName: string;
  nodes: INANode[];
  edges: INAEdge[];
};

export type Action = {
  onNodesChange: OnNodesChange<INANode>;
  onEdgesChange: OnEdgesChange<INAEdge>;
  onConnect: OnConnect;
  setNodes: (nodes: INANode[]) => void;
  setEdges: (edges: INAEdge[]) => void;
  setProjectName: (projectName: string) => void;
};

export type Store = State & Action;

export const store = createStore<Store>((set, get) => ({
  projectName: "",
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
  setProjectName: (projectName) => {
    set({ projectName });
  },
}));
