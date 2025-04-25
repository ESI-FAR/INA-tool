import { InternalNode } from "@xyflow/react";
import { ConnectionMode, EdgeChange, getEdgePosition } from "@xyflow/system";
import { Avoid, AvoidLib } from "libavoid-js";

import { isComponentNode, isStatementNode } from "../node";
import {
  INACEdge,
  isComponentEdge,
  isConflictingEdge,
  isDrivenConnectionEdge,
} from "../edge";
import { INANode } from "../node";
import libavoidWasm from "./libavoid.wasm?url";

export async function reroute({
  nodes,
  edges,
  nodeLookup,
}: {
  nodes: INANode[];
  edges: INACEdge[];
  nodeLookup: Map<string, InternalNode>;
}) {
  await AvoidLib.load(libavoidWasm);

  const Avoid = AvoidLib.getInstance();
  const router = new Avoid.Router(Avoid.OrthogonalRouting);
  const pad = 2;
  // capture statement node positions as component position is relative to the statement node
  const statementNodePositions = new Map<string, { x: number; y: number }>();
  for (const node of nodes) {
    if (!node.measured) {
      continue;
    }
    if (isStatementNode(node)) {
      statementNodePositions.set(node.id, {
        x: node.position.x,
        y: node.position.y,
      });
    }
  }
  for (const node of nodes) {
    if (!node.measured) {
      continue;
    }
    if (isComponentNode(node)) {
      const { x: sx, y: sy } = statementNodePositions.get(node.parentId!) || {
        x: 0,
        y: 0,
      };
      new Avoid.ShapeRef(
        router,
        new Avoid.Rectangle(
          new Avoid.Point(
            node.position.x - pad + sx,
            node.position.y - pad + sy,
          ),
          new Avoid.Point(
            node.position.x + node.measured.width! + pad + sy,
            node.position.y + node.measured.height! + pad + sy,
          ),
        ),
      );
    } else {
      new Avoid.ShapeRef(
        router,
        new Avoid.Rectangle(
          new Avoid.Point(node.position.x - pad, node.position.y - pad),
          new Avoid.Point(
            node.position.x + node.measured.width! + pad,
            node.position.y + node.measured.height! + pad,
          ),
        ),
      );
    }
  }

  const routes = new Map<string, Avoid["ConnRef"]>();
  for (const edge of edges) {
    if (isComponentEdge(edge)) {
      // component edges are not routed
      continue;
    }
    const sourceNode = nodeLookup.get(edge.source);
    const targetNode = nodeLookup.get(edge.target);
    if (!sourceNode || !targetNode) {
      throw new Error(
        `Could not find source or target node for edge ${edge.id}`,
      );
    }
    if (
      typeof edge.sourceHandle !== "string" ||
      typeof edge.targetHandle !== "string"
    ) {
      throw new Error(`Handles are not valid`);
    }
    const ep = getEdgePosition({
      id: edge.id,
      sourceNode,
      sourceHandle: edge.sourceHandle,
      targetNode,
      targetHandle: edge.targetHandle,
      connectionMode: ConnectionMode.Loose,
    });
    if (ep === null) {
      throw new Error(
        `Could not find edge position for edge ${edge.id} from ${edge.source} to ${edge.target}`,
      );
    }
    const connRef = new Avoid.ConnRef(
      router,
      new Avoid.ConnEnd(new Avoid.Point(ep.sourceX, ep.sourceY)),
      new Avoid.ConnEnd(new Avoid.Point(ep.targetX, ep.targetY)),
    );
    routes.set(edge.id, connRef);
  }
  router.processTransaction();
  const changes: EdgeChange<INACEdge>[] = [];
  for (const [edgeId, connRef] of routes.entries()) {
    const route = connRef.displayRoute();
    const nrPoints = route.size();
    const points = [];
    for (let i = 0; i < nrPoints; i++) {
      const point = route.get_ps(i);
      points.push([point.x, point.y]);
    }
    // A edge component already knows it source and target position,
    // so do not store them here
    const bends = points.slice(1, -1);
    const edge = edges
      .filter((e) => isDrivenConnectionEdge(e) || isConflictingEdge(e))
      .find((edge) => edge.id === edgeId)!;
    const item = {
      ...edge,
      data: {
        bends,
      },
    } as INACEdge;
    changes.push({
      id: edgeId,
      type: "replace",
      item,
    });
  }
  return changes;
}
