import { useMemo, useState } from "react";
import { Input } from "./ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { useStore } from "zustand";
import { store } from "@/lib/store";
import { INANode } from "./nodes";
import { ReactFlowInstance, useReactFlow } from "@xyflow/react";
import { INAEdge } from "./edges";
import { isStatementNode } from "@/lib/io";

function searchNodes(query: string, nodes: INANode[]) {
  if (query === "") {
    return [];
  }
  return nodes.filter((node) => {
    return node.data.label.toLowerCase().includes(query.toLowerCase());
  });
}

function zoomToHit(
  node: INANode,
  setCenter: ReactFlowInstance<INANode, INAEdge>["setCenter"],
) {
  if (isStatementNode(node)) {
    return setCenter(node.position.x, node.position.y, { duration: 500 });
  }
  // Inner statement node position needs to be added to its parent statement node position
  const statement = store.getState().nodes.find((n) => n.id === node.parentId);
  if (!statement) {
    throw new Error("Statement not found");
  }
  if (node.hidden) {
    // If inner statement node is hidden, zoom to its parent statement node
    const x = statement.position.x;
    const y = statement.position.y;
    return setCenter(x, y, { duration: 500 });
  }
  const x = statement.position.x + node.position.x;
  const y = statement.position.y + node.position.y;
  return setCenter(x, y, { duration: 500 });
}

export function CanvasSearch() {
  const { setCenter } = useReactFlow();
  const [query, setQuery] = useState("");
  const nodes = useStore(store, (s) => s.nodes);
  const hits = useMemo(() => searchNodes(query, nodes), [query, nodes]);
  return (
    <search>
      <Popover open={hits.length > 0}>
        <PopoverAnchor>
          <Input
            value={query}
            type="search"
            className="w-64"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
          />
        </PopoverAnchor>
        <PopoverContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="max-h-96 overflow-y-auto"
        >
          <ul>
            {hits.map((node) => (
              <li
                key={node.id}
                className="cursor-pointer p-2 hover:bg-secondary hover:text-secondary-foreground"
                onClick={() => {
                  zoomToHit(node, setCenter);
                  setQuery("");
                }}
              >
                {node.parentId ? `${node.parentId}: ` : ""}
                {node.data.label}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </search>
  );
}
