import { createEditor } from "@/lib/graph";
import { store } from "@/store";
import { useEffect } from "react";
import { useRete } from "rete-react-plugin";
import { useStore } from "zustand";
import { Button } from "./ui/button";

export function StatementGraph() {
  const statements = useStore(store, (state) => state.statements);
  const [ref, editor] = useRete(createEditor);

  useEffect(() => {
    if (!editor) return;
    editor.load(statements);
  }, [editor, statements]);

  return (
    <div>
      <h1>GraphCanvas</h1>
      <div className="flex gap-2">
        <Button onClick={() => editor?.layout()} variant="secondary">
          Layout
        </Button>
        <Button onClick={() => editor?.resetZoom()} variant="secondary">
          Reset Zoom
        </Button>
      </div>
      <div ref={ref} className="h-96 w-auto"></div>
    </div>
  );
}
