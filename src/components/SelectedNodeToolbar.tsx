import {
  useOnSelectionChange,
  Node,
  NodeToolbar,
  Position,
} from "@xyflow/react";
import { useCallback, useState } from "react";
import { isStatementNode, StatementNode } from "@/lib/node";
import { StatementCard } from "./StatementCard";
import { Button } from "./ui/button";
import { EyeOff, TrashIcon } from "lucide-react";
import { useStatementDeleter } from "@/hooks/use-statements";

export function SelectedNodeToolbar() {
  const removeStatement = useStatementDeleter();
  const [selectedNodes, setSelectedNodes] = useState<StatementNode[]>([]);
  const onChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    setSelectedNodes(nodes.filter(isStatementNode));
  }, []);

  useOnSelectionChange({
    onChange,
  });

  const clearSelection = useCallback(() => {
    setSelectedNodes([]);
  }, []);

  return (
    <NodeToolbar
      nodeId={selectedNodes.map((node) => node.id)}
      position={Position.Right}
      isVisible={selectedNodes.length > 0}
    >
      <div className="absolute -right-9 top-0 z-10 flex flex-col rounded rounded-s-none border border-l-0 dark:bg-background">
        <Button
          title="Close toolbar and unselect nodes"
          onClick={clearSelection}
          className=" "
          variant="ghost"
          size="icon"
        >
          <EyeOff />
        </Button>
        <Button
          title="Delete selected statements"
          variant="ghost"
          onClick={() => {
            removeStatement(selectedNodes.map((s) => s.id));
          }}
          size="icon"
          className="text-destructive"
        >
          <TrashIcon />
        </Button>
      </div>
      {selectedNodes.map((node) => (
        <StatementCard key={node.id} statement={node.data.raw} />
      ))}
    </NodeToolbar>
  );
}
