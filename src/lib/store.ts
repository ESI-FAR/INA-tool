import { createStore } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { Statement, Conflict, Connection } from "./schema";
import {
  initialProjectName,
  saveProjectName,
  setupStorePersistence,
} from "./persist";

export type State = {
  projectName: string;
  statements: Statement[];
  connections: Connection[];
  conflicts: Conflict[];
};

export type Action = {
  setProjectName: (projectName: string) => void;
  setStatements: (statements: Statement[]) => void;
  setConnections: (connections: Connection[]) => void;
  setConflicts: (conflicts: Conflict[]) => void;
};

export type Store = State & Action;

export const store = createStore<Store>()(
  subscribeWithSelector((set, get) => ({
    projectName: initialProjectName(),
    statements: [],
    connections: [],
    conflicts: [],
    setProjectName: (projectName) => {
      saveProjectName(projectName, get().projectName);
      set({ projectName });
    },
    setStatements: (statements) => {
      set({ statements });
    },
    setConnections: (connections) => {
      set({ connections });
    },
    setConflicts: (conflicts) => {
      set({ conflicts });
    },
  })),
);

setupStorePersistence(store);
