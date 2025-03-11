import { store } from "@/stores/global";
import { json2project, project2json } from "./project2json";

const saveState = () => {
  const state = store.getState();
  const value = project2json();
  localStorage.setItem(`ina-project-${state.projectName}`, value);
};

export function setupStorePersistence() {
  // Skip if not in browser
  if (typeof window === "undefined") return;

  const projectName = store.getState().projectName;
  if (!projectName) return;

  // Load initial state from localStorage
  const savedData = localStorage.getItem(`ina-project-${projectName}`);

  if (savedData) {
    // Restore project from localStorage
    json2project(savedData, projectName);
  }

  // Save on tab close/visibility change
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      saveState();
    }
  });

  // Save on window close
  window.addEventListener("beforeunload", saveState);
}
