import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import ELK from "elkjs/lib/elk-api";
import ELKworker from "elkjs/lib/elk-worker.js?worker";
import { LayoutTemplateIcon } from "lucide-react";
import { Button } from "./ui/button";
import { isComponentNode, isStatementNode } from "@/lib/node";
import type { INANode, StatementNode } from "@/lib/node";
import { INASEdge, INACEdge } from "@/lib/edge";

const elk = new ELK({
  workerFactory: () => {
    return new ELKworker();
  },
});

// TODO make layout multi handle aware
// see https://reactflow.dev/examples/layout/elkjs-multiple-handles
const layoutOptions = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": 140,
  "elk.layered.nodePlacement.strategy": "SIMPLE",
  "elk.spacing.nodeNode": 240,
} as const;

type Port = {
  id: string;
  properties?: {
    side?: "LEFT" | "RIGHT" | "TOP" | "BOTTOM";
    "port.index"?: number;
  };
};

function computePorts(node: INANode) {
  const ports: Port[] = [{ id: node.id }];
  if (!isComponentNode(node)) {
    return ports;
  }
  switch (node.type) {
    case "Activation Condition":
      return ports.concat([
        {
          id: node.parentId + "-activation-condition-2-attribute",
          properties: { side: "RIGHT" },
        },
        { id: "outcome", properties: { side: "TOP", "port.index": 0 } },
        { id: "sanction", properties: { side: "TOP", "port.index": 1 } },
      ]);
    case "Attribute":
      return ports.concat([
        {
          id: node.parentId + "-activation-condition-2-attribute",
          properties: { side: "RIGHT" },
        },
        {
          id: node.parentId + "-attribute-2-aim",
          properties: { side: "LEFT" },
        },
        { id: "actor", properties: { side: "TOP" } },
      ]);
    case "Aim":
      return ports.concat([
        {
          id: node.parentId + "-attribute-2-aim",
          properties: { side: "LEFT" },
        },
        {
          id: node.parentId + "-aim-2-direct-object",
          properties: { side: "RIGHT" },
        },
        {
          id: node.parentId + "-aim-2-execution-constraint",
          properties: { side: "BOTTOM", "port.index": 0 },
        },
        { id: "sanction", properties: { side: "BOTTOM", "port.index": 1 } },
      ]);
    case "Direct Object":
      return ports.concat([
        {
          id: node.parentId + "-aim-2-direct-object",
          properties: { side: "LEFT" },
        },
        {
          id: node.parentId + "-direct-object-2-indirect-object",
          properties: { side: "BOTTOM", "port.index": 0 },
        },
        { id: "actor", properties: { side: "BOTTOM", "port.index": 1 } },
        { id: "outcome", properties: { side: "BOTTOM", "port.index": 1 } },
      ]);
    case "Indirect Object":
      return ports.concat([
        {
          id: node.parentId + "-direct-object-2-indirect-object",
          properties: { side: "TOP" },
        },
        { id: "actor", properties: { side: "BOTTOM" } },
        { id: "outcome", properties: { side: "BOTTOM" } },
      ]);
    case "Execution Constraint":
      return ports.concat([
        {
          id: node.parentId + "-aim-2-execution-constraint",
          properties: { side: "TOP" },
        },
        { id: "actor", properties: { side: "BOTTOM" } },
      ]);
    default:
      throw new Error(`Unknown component type ${node.type}`);
  }
}

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
        const ports = [{ id: node.id }];
        return {
          ...node,
          children: getNodes()
            .filter((n) => n.parentId === node.id && !n.hidden)
            .map((component) => {
              const cports = computePorts(component);
              return {
                ...component,
                width: component.measured!.width,
                height: component.measured!.height,
                properties: {
                  "org.eclipse.elk.portConstraints": "FIXED_ORDER",
                },
                ports: cports,
              };
            }),
          width: node.measured!.width,
          height: node.measured!.height,
          properties: {
            "org.eclipse.elk.portConstraints": "FIXED_ORDER",
          },
          ports,
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
          component.ports = undefined;
          // @ts-expect-error copied from react-flow examples
          componentNodes.push(component);
        });
        node.children = undefined;
        node.ports = undefined;
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
    <Button variant="outline" onClick={autoLayout} title="Auto layout nodes">
      <LayoutTemplateIcon />
      Layout
    </Button>
  );
}

export function StatementLayoutButton() {
  const autoLayout = useStatementLayout();
  return (
    <Button variant="outline" onClick={autoLayout} title="Auto layout nodes">
      <LayoutTemplateIcon />
      Layout
    </Button>
  );
}
