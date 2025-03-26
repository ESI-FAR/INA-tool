import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import ELK, { ElkEdge, ElkExtendedEdge } from "elkjs/lib/elk-api";
import ELKworker from "elkjs/lib/elk-worker.js?worker";
import { LayoutTemplateIcon } from "lucide-react";
import { isComponentNode, isStatementNode } from "@/lib/node";
import type { INANode, StatementNode } from "@/lib/node";
import { INASEdge, INACEdge, isComponentEdge } from "@/lib/edge";
import { DropdownMenuItem } from "./ui/dropdown-menu";

const elk = new ELK({
  workerFactory: () => {
    return new ELKworker();
  },
});

type Port = {
  id: string;
  layoutOptions?: {
    "elk.port.side"?: "WEST" | "EAST" | "NORTH" | "SOUTH";
    "elk.port.index"?: string;
  };
  width?: number;
  height?: number;
};

function computePorts(node: INANode) {
  const ports: Port[] = [
    // { id: node.id }
  ];
  if (!isComponentNode(node)) {
    return ports;
  }
  switch (node.type) {
    case "Activation Condition":
      return ports.concat([
        {
          id: node.parentId + "-Activation Condition-2-Attribute",
          layoutOptions: { "elk.port.side": "EAST", "elk.port.index": "2" },
          width: 5, height: 5,
        },
        {
          id: node.id + "-outcome",
          layoutOptions: { "elk.port.side": "NORTH", "elk.port.index": "0" },
          width: 5, height: 5,
        },
        {
          id: node.id + "-sanction",
          layoutOptions: { "elk.port.side": "NORTH", "elk.port.index": "1" },
          width: 5, height: 5,
        },
      ]);
    case "Attribute":
      return ports.concat([
        {
          id: node.parentId + "-Attribute-2-Activation Condition",
          layoutOptions: { "elk.port.side": "WEST", "elk.port.index": "0" },
          width: 5, height: 5,
        },
        {
          id: node.parentId + "-Attribute-2-Aim",
          layoutOptions: { "elk.port.side": "EAST", "elk.port.index": "1" },
          width: 5, height: 5,
        },
        {
          id: node.id + "-actor",
          layoutOptions: { "elk.port.side": "NORTH", "elk.port.index": "2" },
          width: 5, height: 5,
        },
      ]);
    case "Aim":
      return ports.concat([
        {
          id: node.parentId + "-Aim-2-Attribute",
          layoutOptions: { "elk.port.side": "WEST", "elk.port.index": "2" },
          width: 5, height: 5,
        },
        {
          id: node.parentId + "-Aim-2-Direct Object",
          layoutOptions: { "elk.port.side": "EAST", "elk.port.index": "3" },
          width: 5, height: 5,
        },
        {
          id: node.parentId + "-Aim-2-Execution Constraint",
          layoutOptions: { "elk.port.side": "SOUTH", "elk.port.index": "0" },
          width: 5, height: 5,
        },
        {
          id: node.id + "-sanction",
          layoutOptions: { "elk.port.side": "SOUTH", "elk.port.index": "1" },
          width: 5, height: 5,
        },
      ]);
    case "Direct Object":
      return ports.concat([
        {
          id: node.parentId + "-Direct Object-2-Aim",
          layoutOptions: { "elk.port.side": "WEST", "elk.port.index": "2" },
          width: 5, height: 5,
        },
        {
          id: node.parentId + "-Direct Object-2-Indirect Object",
          layoutOptions: { "elk.port.side": "SOUTH", "elk.port.index": "0" },
          width: 5, height: 5,
        },
        node.data.animation === "animate"
          ? {
          id: node.id + "-actor",
          layoutOptions: { "elk.port.side": "SOUTH", "elk.port.index": "1" },
          width: 5, height: 5,
        }
          : {
          id: node.id + "-outcome",
          layoutOptions: { "elk.port.side": "SOUTH", "elk.port.index": "1" },
          width: 5, height: 5,
        },
      ]);
    case "Indirect Object":
      return ports.concat([
        {
          id: node.parentId + "-Indirect Object-2-Direct Object",
          layoutOptions: { "elk.port.side": "NORTH", "elk.port.index": "0" },
          width: 5, height: 5,
        },
        node.data.animation === "animate"
          ? {
          id: node.id + "-actor",
          layoutOptions: { "elk.port.side": "SOUTH", "elk.port.index": "1" },
          width: 5, height: 5,
        }
          : {
          id: node.id + "-outcome",
          layoutOptions: { "elk.port.side": "SOUTH", "elk.port.index": "1" },
          width: 5, height: 5,
        },
      ]);
    case "Execution Constraint":
      return ports.concat([
        {
          id: node.parentId + "-Execution Constraint-2-Aim",
          layoutOptions: { "elk.port.side": "NORTH", "elk.port.index": "0" },
          width: 5, height: 5,
        },
        {
          id: node.id + "-actor",
          layoutOptions: { "elk.port.side": "SOUTH", "elk.port.index": "1" },
          width: 5, height: 5,
        },
      ]);
    default:
      throw new Error(`Unknown component type ${node.type}`);
  }
}

/*
 * https://rtsys.informatik.uni-kiel.de/elklive/models.html?link=realworld%2Fptolemy%2Fhierarchical%2Faspect_cartrackingattackmodeling_CarTrackingAttackModeling.json
 * https://rtsys.informatik.uni-kiel.de/elklive/models.html?link=realworld%2Fptolemy%2Fhierarchical%2Ftm_mergedevents_MergedEvents.json
 */

// TODO make layout multi handle aware
// see https://reactflow.dev/examples/layout/elkjs-multiple-handles
const layoutOptions = {
  "elk.algorithm": "layered",
  // "elk.layered.spacing.nodeNodeBetweenLayers": 100,

  // "elk.spacing.nodeNode": 40,
  // "elk.padding": "[top=20,left=20,bottom=20,right=20]",
  // "elk.direction": "RIGHT",
  // "elk.direction": "DOWN", // Statements underneat each other

  "elk.hierarchyHandling": "INCLUDE_CHILDREN",
  // "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
  // "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
  // "elk.layered.mergeEdges": "True",
  // "elk.layered.edgeRouting.splines.mode": "CONSERVATIVE",

  // "elk.layered.layering.strategy": "LONGEST_PATH",
  // "elk.layered.considerModelOrder.portModelOrder": true,
  // "elk.layered.considerModelOrder.crossingCounterPortInfluence": 0.001,

  // "elk.edgeRouting": "ORTHOGONAL",
  // "elk.layered.allowNonFlowPortsToSwitchSides": true,
  // "elk.layered.crossingMinimization.greedySwitchHierarchical.type": "TWO_SIDED",
} as const;

export const useComponentLayout = () => {
  const { getNodes, setNodes, getEdges, setEdges, fitView } = useReactFlow<
    INANode,
    INACEdge
  >();

  const getLayoutedElements = useCallback(async () => {
    const statementNodes = getNodes().filter(isStatementNode);
    const edges = getEdges();
    const nodePadding = 15;
    const graph = {
      id: "root",
      layoutOptions: {
        ...layoutOptions,
      },
      children: statementNodes.map((node) => {
        const componentEdges = edges
          .filter(isComponentEdge)
          .filter((e) => e.data?.statementId === node.id)
          .map((edge) => {
            let source = edge.source + "-" + edge.type;
            let target = edge.target + "-" + edge.type;
            if (edge.type === "component") {
              source =
                edge.source +
                "-2-" +
                edge.target.replace(edge.data?.statementId + "-", "");
              target =
                edge.target +
                "-2-" +
                edge.source.replace(edge.data?.statementId + "-", "");
            }
            // TODO 
            const elkedge: ElkExtendedEdge ={
              id: edge.id,
              sources: [source],
              targets: [target],
            };
            if (edge.label) {
              elkedge.labels = [{ 
                text: edge.label as string ,
                layoutOptions: {
                  // TODO label is placed right instead of center
                  "elk.edgeLabels.placement": "CENTER",
                }
              }]
            }
            return elkedge;
          });
        return {
          id: node.id,
          width: node.measured!.width,
          height: node.measured!.height,
          labels: [{ text: node.data.label }],
          children: getNodes()
            .filter((n) => n.parentId === node.id && !n.hidden)
            .map((component) => {
              const cports = computePorts(component);
              return {
                id: component.id,
                width: component.measured!.width,
                height: component.measured!.height,
                // x: component.position?.x,
                // y: component.position?.y,
                labels: [{ text: component.data.label }],
                layoutOptions: {
                  // "elk.direction": "RIGHT", // Components next to each other
                  "elk.portConstraints": "FIXED_ORDER",
                  // "elk.spacing.nodeNode": nodePadding.toString(),
                  // "elk.padding": `[top=${nodePadding},left=${nodePadding},bottom=${nodePadding},right=${nodePadding}]`,
                  // "elk.spacing.portPort": "10",
                  "nodeLabels.placement": "[INSIDE]",
                },
                ports: cports,
              };
            }),
          layoutOptions: {
            // "elk.direction": "RIGHT", // Components next to each other
            "elk.portConstraints": "FIXED_ORDER",
            // "elk.spacing.nodeNode": nodePadding.toString(),
            // "elk.padding": `[top=${nodePadding},left=${nodePadding},bottom=${nodePadding},right=${nodePadding}]`,
            // "elk.spacing.portPort": "10",
            "elk.nodeLabels.placement": "[INSIDE]"
          },
          edges: componentEdges,
        };
      }),
      edges: edges
        .filter((e) => !isComponentEdge(e))
        .map((edge) => {
          let source = edge.source + "-" + edge.type;
          let target = edge.target + "-" + edge.type;
          if (edge.type === "component") {
            source =
              edge.source +
              "-2-" +
              edge.target.replace(edge.data?.statementId + "-", "");
            target =
              edge.target +
              "-2-" +
              edge.source.replace(edge.data?.statementId + "-", "");
          }
          return {
            id: edge.id,
            sources: [source],
            targets: [target],
          };
        }),
    };

    console.log(JSON.stringify(graph));
    // @ts-expect-error copied from react-flow examples
    const layout = await elk.layout(graph);
    // console.log(JSON.stringify(layout))

    // TODO copy positions and edge sections back to react-flow graph
    return
    

    const { children } = layout;
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

      // @ts-expect-error copied from react-flow examples
      setNodes([...children, ...componentNodes]);

      const statementEdges = layout.edges!.map((e) => {
        return {
          ...e,
          data: {
            ...e.data,
            bendPoints: e.sections![0].bendPoints,
            startPoint: e.sections![0].startPoint,
            endPoint: e.sections![0].endPoint,
          },
        };
      });
      const componentEdges = children!.flatMap((statement) => statement.edges);

      setEdges([...statementEdges, ...componentEdges] as unknown as INACEdge[]);

      window.requestAnimationFrame(() => {
        fitView();
      });
    });
  }, [fitView, getEdges, getNodes, setNodes, setEdges]);

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
      Layout
    </DropdownMenuItem>
  );
}

export function StatementLayoutButton() {
  const autoLayout = useStatementLayout();
  return (
    <DropdownMenuItem onClick={autoLayout} title="Auto layout nodes">
      <LayoutTemplateIcon />
      Layout
    </DropdownMenuItem>
  );
}
