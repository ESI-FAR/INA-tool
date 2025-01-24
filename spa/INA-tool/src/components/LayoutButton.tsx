import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ELK from "elkjs/lib/elk.bundled";
import { LayoutTemplateIcon } from "lucide-react";
import { Button } from "./ui/button";

const elk = new ELK();

const layoutOptions = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": 100,
  "elk.spacing.nodeNode": 20,
  "elk.direction": "RIGHT",
} as const;

const useLayoutedElements = () => {
  const { getNodes, setNodes, getEdges, fitView } = useReactFlow();

  const getLayoutedElements = useCallback(() => {
    const graph = {
      id: "root",
      layoutOptions,
      children: getNodes().map((node) => ({
        ...node,
        width: node.measured!.width,
        height: node.measured!.height,
      })),
      edges: getEdges(),
    };

    // @ts-expect-error copied from react-flow examples
    elk.layout(graph).then(({ children }) => {
      // By mutating the children in-place we saves ourselves from creating a
      // needless copy of the nodes array.
      children!.forEach((node) => {
        // @ts-expect-error copied from react-flow examples
        node.position = { x: node.x, y: node.y };
      });

      // @ts-expect-error copied from react-flow examples
      setNodes(children);
      window.requestAnimationFrame(() => {
        fitView();
      });
    });
  }, [fitView, getEdges, getNodes, setNodes]);

  return getLayoutedElements;
};

export function LayoutButton() {
  const getLayoutedElements = useLayoutedElements();
  return (
    <Button
      variant="outline"
      onClick={getLayoutedElements}
      title="Auto layout nodes"
    >
      <LayoutTemplateIcon />
      Layout
    </Button>
  );
}
