import { createStore } from "zustand";
import { Statement } from "./lib/schema";

type State = {
  projectName: string;
  statements: Statement[];
};

type Action = {
  setStatements: (statements: State["statements"]) => void;
  setProjectName: (projectName: State["projectName"]) => void;
};

type Store = State & Action;

export const store = createStore<Store>()((set) => ({
  projectName: "",
  statements: [],
  setStatements: (statements: Statement[]) => set({ statements }),
  setProjectName: (projectName: string) => set({ projectName }),
}));
