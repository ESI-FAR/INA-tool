import { State } from "@/stores/component-network";
import {
  ComponentNode,
  INANode,
  isComponentNode,
  isStatementNode,
} from "./node";
import { ElkExtendedEdge, ElkNode } from "elkjs/lib/elk-api";
import {
  ComponentEdge,
  INASEdge,
  isComponentEdge,
  isConflictingEdge,
  isDrivenConnectionEdge,
} from "./edge";

const nodePadding = 25;
const padding = `[top=${nodePadding},left=${nodePadding},bottom=${nodePadding},right=${nodePadding}]`;

type Port = {
  id: string;
  layoutOptions?: {
    "elk.port.side"?: "WEST" | "EAST" | "NORTH" | "SOUTH";
    "elk.port.index"?: string;
  };
  width?: number;
  height?: number;
};

function computePorts(node: ComponentNode) {
  const ports: Port[] = [];
  switch (node.type) {
    case "Activation Condition":
      return ports.concat([
        {
          id: node.parentId + "-Activation Condition-2-Attribute",
          layoutOptions: { "elk.port.side": "EAST", "elk.port.index": "2" },
          width: 5,
          height: 5,
        },
        {
          id: node.id + "-outcome",
          layoutOptions: { "elk.port.side": "NORTH", "elk.port.index": "0" },
          width: 5,
          height: 5,
        },
        {
          id: node.id + "-sanction",
          layoutOptions: { "elk.port.side": "NORTH", "elk.port.index": "1" },
          width: 5,
          height: 5,
        },
      ]);
    case "Attribute":
      return ports.concat([
        {
          id: node.parentId + "-Attribute-2-Activation Condition",
          layoutOptions: { "elk.port.side": "WEST", "elk.port.index": "0" },
          width: 5,
          height: 5,
        },
        {
          id: node.parentId + "-Attribute-2-Aim",
          layoutOptions: { "elk.port.side": "EAST", "elk.port.index": "1" },
          width: 5,
          height: 5,
        },
        {
          id: node.id + "-actor",
          layoutOptions: { "elk.port.side": "NORTH", "elk.port.index": "2" },
          width: 5,
          height: 5,
        },
      ]);
    case "Aim":
      return ports.concat([
        {
          id: node.parentId + "-Aim-2-Attribute",
          layoutOptions: { "elk.port.side": "WEST", "elk.port.index": "2" },
          width: 5,
          height: 5,
        },
        {
          id: node.parentId + "-Aim-2-Direct Object",
          layoutOptions: { "elk.port.side": "EAST", "elk.port.index": "3" },
          width: 5,
          height: 5,
        },
        {
          id: node.parentId + "-Aim-2-Execution Constraint",
          layoutOptions: { "elk.port.side": "SOUTH", "elk.port.index": "0" },
          width: 5,
          height: 5,
        },
        {
          id: node.id + "-sanction",
          layoutOptions: { "elk.port.side": "SOUTH", "elk.port.index": "1" },
          width: 5,
          height: 5,
        },
      ]);
    case "Direct Object":
      return ports.concat([
        {
          id: node.parentId + "-Direct Object-2-Aim",
          layoutOptions: { "elk.port.side": "WEST", "elk.port.index": "2" },
          width: 5,
          height: 5,
        },
        {
          id: node.parentId + "-Direct Object-2-Indirect Object",
          layoutOptions: { "elk.port.side": "SOUTH", "elk.port.index": "0" },
          width: 5,
          height: 5,
        },
        node.data.animation === "animate"
          ? {
              id: node.id + "-actor",
              layoutOptions: {
                "elk.port.side": "SOUTH",
                "elk.port.index": "1",
              },
              width: 5,
              height: 5,
            }
          : {
              id: node.id + "-outcome",
              layoutOptions: {
                "elk.port.side": "SOUTH",
                "elk.port.index": "1",
              },
              width: 5,
              height: 5,
            },
      ]);
    case "Indirect Object":
      return ports.concat([
        {
          id: node.parentId + "-Indirect Object-2-Direct Object",
          layoutOptions: { "elk.port.side": "NORTH", "elk.port.index": "0" },
          width: 5,
          height: 5,
        },
        node.data.animation === "animate"
          ? {
              id: node.id + "-actor",
              layoutOptions: {
                "elk.port.side": "SOUTH",
                "elk.port.index": "1",
              },
              width: 5,
              height: 5,
            }
          : {
              id: node.id + "-outcome",
              layoutOptions: {
                "elk.port.side": "SOUTH",
                "elk.port.index": "1",
              },
              width: 5,
              height: 5,
            },
      ]);
    case "Execution Constraint":
      return ports.concat([
        {
          id: node.parentId + "-Execution Constraint-2-Aim",
          layoutOptions: { "elk.port.side": "NORTH", "elk.port.index": "0" },
          width: 5,
          height: 5,
        },
        {
          id: node.id + "-actor",
          layoutOptions: { "elk.port.side": "SOUTH", "elk.port.index": "1" },
          width: 5,
          height: 5,
        },
      ]);
    default:
      throw new Error(`Unknown component type ${node.type}`);
  }
}

function componentNodeToElk(component: ComponentNode): ElkNode {
  const cports = computePorts(component);
  return {
    id: component.id,
    width: component.measured!.width,
    height: component.measured!.height,
    // x: component.position?.x,
    // y: component.position?.y,
    labels: [
      {
        text: component.data.label,
        layoutOptions: {
          "nodeLabels.placement": "INSIDE V_TOP H_LEFT",
        },
      },
    ],
    layoutOptions: {
      "elk.portConstraints": "FIXED_ORDER",
    },
    ports: cports,
  };
}

function componentEdgeToElk(edge: ComponentEdge): ElkExtendedEdge {
  const source =
    edge.source + "-2-" + edge.target.replace(edge.data?.statementId + "-", "");
  const target =
    edge.target + "-2-" + edge.source.replace(edge.data?.statementId + "-", "");
  const elkedge: ElkExtendedEdge = {
    id: edge.id,
    sources: [source],
    targets: [target],
  };
  if (edge.label) {
    elkedge.labels = [
      {
        text: edge.label as string,
      },
    ];
  }
  return elkedge;
}

function statementNodeToElk(statement: INANode, reactflow: State): ElkNode {
  // Components of statement
  const children: ElkNode[] = reactflow.nodes
    .filter((n) => n.parentId === statement.id && !n.hidden)
    .filter(isComponentNode)
    .map(componentNodeToElk);
  // Edges between components
  const edges: ElkExtendedEdge[] = reactflow.edges
    .filter(isComponentEdge)
    .filter((e) => e.data?.statementId === statement.id)
    .map(componentEdgeToElk);
  return {
    id: statement.id,
    width: statement.measured!.width,
    height: statement.measured!.height,
    labels: [
      {
        text: statement.data.label,
        layoutOptions: {
          "nodeLabels.placement": "INSIDE V_TOP H_LEFT",
        },
      },
    ],
    layoutOptions: {
      "elk.portConstraints": "FIXED_ORDER",
      "elk.padding": padding,
    },
    children,
    edges,
    ports: [
      {
        id: statement.id + "-conflict-target",
        layoutOptions: { "elk.port.side": "WEST", "elk.port.index": "0" },
        width: 5,
        height: 5,
      },
      {
        id: statement.id + "-conflict-source",
        layoutOptions: { "elk.port.side": "EAST", "elk.port.index": "0" },
        width: 5,
        height: 5,
      },
    ],
  };
}

function statementEdgeToElk(edge: INASEdge): ElkExtendedEdge {
  if (edge.type === "conflict") {
    return {
      id: edge.id,
      sources: [edge.source + "-conflict-source"],
      targets: [edge.target + "-conflict-target"],
    };
  }
  return {
    id: edge.id,
    sources: [edge.source + "-" + edge.type],
    targets: [edge.target + "-" + edge.type],
  };
}

export function reactflow2elk(reactflow: State): ElkNode {
  const statementNodes = reactflow.nodes.filter(isStatementNode);
  const children: ElkNode[] = statementNodes.map((node) =>
    statementNodeToElk(node, reactflow),
  );
  const edges: ElkExtendedEdge[] = reactflow.edges
    .filter((e) => isDrivenConnectionEdge(e) || isConflictingEdge(e))
    .map(statementEdgeToElk);
  const graph: ElkNode = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.edgeRouting": "POLYLINE",
      "elk.hierarchyHandling": "INCLUDE_CHILDREN",
      "elk.layered.wrapping.strategy": "MULTI_EDGE",
      "elk.layered.layering.strategy": "MIN_WIDTH",
    },
    children,
    edges,
  };

  return graph;
}

export function applyLayoutToReactFlow(
  elkNode: ElkNode,
  reactflow: State,
): State {
  const rfNodeLookup = new Map(reactflow.nodes.map((node) => [node.id, node]));
  for (const statementNode of elkNode.children || []) {
    const rfStatementNode = rfNodeLookup.get(statementNode.id);
    if (!rfStatementNode || !statementNode.x || !statementNode.y) {
      throw new Error(`Node ${statementNode.id} not found`);
    }
    rfStatementNode.position = {
      x: statementNode.x,
      y: statementNode.y,
    };
    rfStatementNode.width = statementNode.width;
    rfStatementNode.height = statementNode.height;
    for (const componentNode of statementNode.children || []) {
      const rfCompNode = rfNodeLookup.get(componentNode.id);
      if (!rfCompNode || !componentNode.x || !componentNode.y) {
        throw new Error(`Node ${statementNode.id} not found`);
      }
      rfCompNode.position = {
        x: componentNode.x,
        y: componentNode.y,
      };
      // rfCompNode.width = componentNode.width;
      // rfCompNode.height = componentNode.height;
    }
  }
  for (const edge of elkNode.edges || []) {
    const rfEdge = reactflow.edges.find((e) => e.id === edge.id);
    if (!rfEdge) {
      throw new Error(`Edge ${edge.id} not found`);
    }
    rfEdge.data = {
      ...rfEdge.data,
      sections: edge.sections,
    };
  }

  return { ...reactflow };
}
