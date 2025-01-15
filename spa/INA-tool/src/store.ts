import { createStore } from "zustand";
import { Statement } from "./lib/schema";

export interface Connection {
  source_statement: string;
  source_node: string;
  target_statement: string;
  target_node: string;
  color: "green" | "purple" | "red";
}

type State = {
  projectName: string;
  statements: Statement[];
  connections: Connection[];
};

type Action = {
  setStatements: (statements: State["statements"]) => void;
  setProjectName: (projectName: State["projectName"]) => void;
};

type Store = State & Action;

export const store = createStore<Store>()((set) => ({
  projectName: "",
  statements: [],
  connections: [],
  setStatements: (statements: Statement[]) => set({ statements }),
  setProjectName: (projectName: string) => set({ projectName }),
}));
