import { StoreApi } from "zustand";
import type { Store } from "./store";

export function initialProjectName() {
  // Initialize project name from URL query parameter
  return typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("project") || ""
    : "";
}

export function saveProjectName(projectName: string, prevProjectName: string) {
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
}

export function setupStorePersistence(store: StoreApi<Store>) {
  // Skip if not in browser
  if (typeof window === "undefined") return;

  const projectName = store.getState().projectName;
  if (!projectName) return;

  // Load initial state from localStorage
  const savedData = localStorage.getItem(`ina-project-${projectName}`);

  // TODO reimplement
  return;
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
