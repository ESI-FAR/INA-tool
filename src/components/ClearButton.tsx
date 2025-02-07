import { store } from "@/lib/store";
import { TrashIcon } from "lucide-react";
import { Button } from "./ui/button";

function removeAllData() {
  const projectName = store.getState().projectName;
  localStorage.removeItem(`ina-project-${projectName}`);
  window.history.replaceState({}, "", "?project=");
  store.setState({
    projectName: "",
    statements: [],
    connections: [],
    conflicts: [],
  });
}

export function ClearButton() {
  // TODO only show|enable clear button if there are nodes or edges
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
