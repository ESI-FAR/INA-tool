import { TrashIcon } from "lucide-react";
import { Button } from "./ui/button";
import { store } from "@/stores/global";
import { useEffect } from "react";

function removeAllData() {
  const projectName = store.getState().projectName;
  localStorage.removeItem(`ina-project-${projectName}`);
  window.history.replaceState({}, "", "?project=" + window.location.hash);
  store.setState({
    projectName: "Untitled",
    statements: [],
    connections: [],
    conflicts: [],
  });
}

export function ClearButton() {
  // TODO only show|enable clear button if there are nodes or edges

  // Add keyboard shortcut for clearing data
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        removeAllData();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Button
      title="Remove all data"
      variant="outline"
      className="bg-destructive text-destructive-foreground"
      onClick={() => {
        if (confirm("Are you sure you want to remove all data?")) {
          removeAllData();
        }
      }}
    >
      <TrashIcon /> Clear
    </Button>
  );
}
