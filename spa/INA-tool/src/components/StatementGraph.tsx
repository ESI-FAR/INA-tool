import { createEditor } from "@/lib/graph";
import { useRete } from "rete-react-plugin";

export function StatementGraph() {
  const [ref, editor] = useRete(createEditor)

  return (
    <div>
      <h1>GraphCanvas</h1>
      <div ref={ref} className="w-screen h-96"></div>
    </div>
  );
}
