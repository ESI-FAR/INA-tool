import {
  useOnSelectionChange,
  Node,
  NodeToolbar,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, useState } from "react";
import "@xyflow/react/dist/style.css";
import { isStatementNode, StatementNode } from "@/lib/node";
import { StatementCard } from "./StatementCard";
import { Button } from "./ui/button";

export function SelectedNodeToolbar() {
  const [selectedNodes, setSelectedNodes] = useState<StatementNode[]>([]);
  const onChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    setSelectedNodes(nodes.filter(isStatementNode));
  }, []);

  useOnSelectionChange({
    onChange,
  });

  const { updateNode } = useReactFlow();
  const clearSelection = useCallback(() => {
    for (const node of selectedNodes) {
      updateNode(node.id, {
        selected: false,
      });
    }
  }, [selectedNodes, updateNode]);
  return (
    <NodeToolbar
      nodeId={selectedNodes.map((node) => node.id)}
      position={Position.Right}
      isVisible={selectedNodes.length > 0}
    >
      <Button
        title="Close toolbar and unselect nodes"
        onClick={clearSelection}
        className="absolute -right-9 top-0 z-10 rounded rounded-s-none border border-l-0 dark:bg-background"
        variant="ghost"
        size="icon"
      >
        ✕
      </Button>
      {selectedNodes.map((node) => (
        <StatementCard statement={node.data.raw} />
      ))}
    </NodeToolbar>
  );
}
