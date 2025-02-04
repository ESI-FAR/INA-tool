import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ELK from "elkjs/lib/elk.bundled";
import { LayoutTemplateIcon } from "lucide-react";
import { Button } from "./ui/button";
import { isStatementNode } from "@/lib/node";
import type { INANode } from "@/lib/node";
import { isDrivenConnectionEdge, type INAEdge } from "@/lib/edge";
import { store } from "@/lib/store";

const elk = new ELK();

const layoutOptions = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": 100,
  "elk.spacing.nodeNode": 40,
  "elk.direction": "RIGHT",
} as const;

export const useAutoLayout = () => {
  const { getNodes, setNodes, getEdges, fitView } = useReactFlow<
    INANode,
    INAEdge
  >();

  const getLayoutedElements = useCallback(() => {
    const statementNodes = getNodes().filter(isStatementNode);
    const isCompact = store.getState().isCompact;
    const edges = isCompact
      ? getEdges().filter(isDrivenConnectionEdge)
      : getEdges();
    const graph = {
      id: "root",
      layoutOptions: {
        ...layoutOptions,
        "elk.direction": isCompact ? "DOWN" : "RIGHT",
      },
      children: statementNodes.map((node) => {
        return {
          ...node,
          children: getNodes()
            .filter((n) => n.parentId === node.id && !n.hidden)
            .map((innerstatement) => {
              return {
                ...innerstatement,
                width: innerstatement.measured!.width,
                height: innerstatement.measured!.height,
              };
            }),
          width: node.measured!.width,
          height: node.measured!.height,
        };
      }),
      edges,
    };

    // @ts-expect-error copied from react-flow examples
    elk.layout(graph).then(({ children }) => {
      // By mutating the children in-place we saves ourselves from creating a
      // needless copy of the nodes array.
      const innernodes: INANode[] = isCompact
        ? getNodes().filter((n) => n.type !== "statement")
        : [];
      children!.forEach((node) => {
        // @ts-expect-error copied from react-flow examples
        node.position = { x: node.x, y: node.y };
        node.children!.forEach((innerstatement) => {
          // @ts-expect-error copied from react-flow examples
          innerstatement.position = {
            x: innerstatement.x,
            y: innerstatement.y,
          };
          // @ts-expect-error copied from react-flow examples
          innernodes.push(innerstatement);
        });
        node.children = undefined;
      });

      // @ts-expect-error copied from react-flow examples
      setNodes([...children, ...innernodes]);
      window.requestAnimationFrame(() => {
        fitView();
      });
    });
  }, [fitView, getEdges, getNodes, setNodes]);

  return getLayoutedElements;
};

export function LayoutButton() {
  const autoLayout = useAutoLayout();
  return (
    <Button variant="outline" onClick={autoLayout} title="Auto layout nodes">
      <LayoutTemplateIcon />
      Layout
    </Button>
  );
}
