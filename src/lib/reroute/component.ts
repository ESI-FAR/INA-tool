import { EdgeChange } from "@xyflow/system";
import { ReactFlowInstance } from "@xyflow/react";

import { store as networkStore } from "@/stores/component-network";
import { INACEdge, isComponentEdge } from "../edge";
import RerouteWorker from "./worker?worker";

export async function reRouteConnections(reactflow: ReactFlowInstance) {
  const nodes = networkStore.getState().nodes;
  const nodeLookup = new Map(
    nodes.map((node) => [node.id, reactflow.getInternalNode(node.id)!]),
  );
  const edges = networkStore.getState().edges;

  const worker = new RerouteWorker();
  return new Promise<void>((resolve) => {
    worker.onmessage = (event) => {
      const changes = event.data;
      networkStore.getState().onEdgesChange(changes);
      resolve();
    };
    worker.onerror = (error) => {
      console.error("Worker error:", error);
      worker.terminate();
      resolve();
    };

    worker.postMessage({
      nodes,
      edges,
      nodeLookup,
    });
  });
}

export function undoReroutedConnections() {
  const changes: EdgeChange<INACEdge>[] = [];
  const edges = networkStore.getState().edges;
  for (const edge of edges) {
    if (!isComponentEdge(edge) && edge.data?.bends) {
      const item = {
        ...edge,
        data: {
          bends: undefined,
        },
      } as INACEdge;
      changes.push({
        id: edge.id,
        type: "replace",
        item,
      });
    }
  }
  networkStore.getState().onEdgesChange(changes);
}
