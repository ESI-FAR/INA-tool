import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import ELK from "elkjs/lib/elk-api";
import ELKworker from "elkjs/lib/elk-worker.js?worker";
import { LayoutTemplateIcon } from "lucide-react";
import { isStatementNode } from "@/lib/node";
import type { INANode, StatementNode } from "@/lib/node";
import { INASEdge, INACEdge } from "@/lib/edge";
import { DropdownMenuItem } from "./ui/dropdown-menu";

const elk = new ELK({
  workerFactory: () => {
    return new ELKworker();
  },
});

// TODO make layout multi handle aware
// see https://reactflow.dev/examples/layout/elkjs-multiple-handles
const layoutOptions = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": 100,
  "elk.spacing.nodeNode": 40,
  "elk.direction": "RIGHT",
} as const;

const useComponentLayout = () => {
  const { getNodes, setNodes, getEdges, fitView } = useReactFlow<
    INANode,
    INACEdge
  >();

  const getLayoutedElements = useCallback(() => {
    const statementNodes = getNodes().filter(isStatementNode);
    const edges = getEdges();
    const graph = {
      id: "root",
      layoutOptions: {
        ...layoutOptions,
        "elk.direction": "RIGHT",
      },
      children: statementNodes.map((node) => {
        return {
          ...node,
          children: getNodes()
            .filter((n) => n.parentId === node.id && !n.hidden)
            .map((component) => {
              return {
                ...component,
                width: component.measured!.width,
                height: component.measured!.height,
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
      const componentNodes: INANode[] = [];
      children!.forEach((node) => {
        // @ts-expect-error copied from react-flow examples
        node.position = { x: node.x, y: node.y };
        node.children!.forEach((component) => {
          // @ts-expect-error copied from react-flow examples
          component.position = {
            x: component.x,
            y: component.y,
          };
          // @ts-expect-error copied from react-flow examples
          componentNodes.push(component);
        });
        node.children = undefined;
      });

      // @ts-expect-error copied from react-flow examples
      setNodes([...children, ...componentNodes]);
      window.requestAnimationFrame(() => {
        fitView();
      });
    });
  }, [fitView, getEdges, getNodes, setNodes]);

  return getLayoutedElements;
};

function useStatementLayout() {
  const { getNodes, setNodes, getEdges, fitView } = useReactFlow<
    StatementNode,
    INASEdge
  >();
  const getLayoutedElements = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();
    const graph = {
      id: "root",
      layoutOptions: {
        ...layoutOptions,
        "elk.direction": "DOWN",
      },
      children: nodes.map((node) => ({
        ...node,
        width: node.measured!.width,
        height: node.measured!.height,
      })),
      edges,
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
}

export function ComponentLayoutButton() {
  const autoLayout = useComponentLayout();
  return (
    <DropdownMenuItem onClick={autoLayout} title="Auto layout nodes">
      <LayoutTemplateIcon />
      Auto layout
    </DropdownMenuItem>
  );
}

export function StatementLayoutButton() {
  const autoLayout = useStatementLayout();
  return (
    <DropdownMenuItem onClick={autoLayout} title="Auto layout nodes">
      <LayoutTemplateIcon />
      Auto layout
    </DropdownMenuItem>
  );
}
