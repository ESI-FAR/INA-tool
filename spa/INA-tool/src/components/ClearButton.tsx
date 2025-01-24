import { store } from "@/lib/store";
import { DeleteIcon } from "lucide-react";
import { Button } from "./ui/button";

export function ClearButton() {
  // TODO only show|enable clear button if there are nodes or edges
  return (
    <Button
      title="Remove all data"
      variant="outline"
      onClick={() => {
        const projectName = store.getState().projectName;
        localStorage.removeItem(`ina-project-${projectName}`);
        window.history.replaceState({}, "", "?project=");
        store.setState({ projectName: "", nodes: [], edges: [] });
      }}
    >
      <DeleteIcon /> Clear
    </Button>
  );
}
