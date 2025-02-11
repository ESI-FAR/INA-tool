import { Conflict, Connection, Statement } from "@/lib/schema";
import { createStore } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

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

function initialProjectName() {
  // Initialize project name from URL query parameter
  return typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("project") || ""
    : "";
}

function saveProjectName(projectName: string, prevProjectName: string) {
  if (prevProjectName === projectName) {
    return;
  }
  if (prevProjectName !== "" && prevProjectName !== projectName) {
    localStorage.removeItem(`ina-project-${prevProjectName}`);
  }
  if (typeof window !== "undefined") {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("project", projectName);
    window.history.replaceState(
      {},
      "",
      `?${searchParams.toString()}${window.location.hash}`,
    );
  }
}

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
