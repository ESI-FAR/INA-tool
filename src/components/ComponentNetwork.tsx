import { useStore } from "zustand";
import { useTheme } from "./theme-provider";
import { store } from "@/stores/component-network";
import {
  Connection as ReactFlowConnection,
  Controls,
  ReactFlow,
} from "@xyflow/react";
import { ConnectionLine } from "./ConnectionLine";
import { edgeTypes } from "./edges";
import { nodeTypes } from "./nodes";
import "@xyflow/react/dist/style.css";
import { useConnections } from "@/hooks/use-connections";
import {
  Connection,
  drivenbySchema,
  SourceComponentSchema,
  TargetComponentSchema,
} from "@/lib/schema";
import { MyMiniMap } from "./MyMiniMap";

function mapReactFlowConnectionToINAConnection(
  connection: ReactFlowConnection,
): Connection {
  const nodes = store.getState().nodes;
  const sourceNode = nodes.find((node) => node.id === connection.source);
  const targetNode = nodes.find((node) => node.id === connection.target);
  if (!sourceNode || !sourceNode.parentId) {
    throw new Error(`Source node ${connection.source} not found`);
  }
  if (!targetNode || !targetNode.parentId) {
    throw new Error(`Target node ${connection.target} not found`);
  }
  if (!connection.targetHandle) {
    throw new Error("Connection targetHandle is required");
  }
  return {
    source_statement: sourceNode.parentId,
    source_component: SourceComponentSchema.parse(sourceNode.type),
    target_statement: targetNode.parentId,
    target_component: TargetComponentSchema.parse(targetNode.type),
    driven_by: drivenbySchema.parse(connection.targetHandle),
  };
}

const MAX_VISIBLE_STATEMENTS = 500;

export function ComponentNetwork() {
  const { theme } = useTheme();
  const { nodes, edges, onNodesChange, onEdgesChange } = useStore(store);
  const { addConnection } = useConnections();

  function onConnect(connection: ReactFlowConnection) {
    addConnection(mapReactFlowConnectionToINAConnection(connection));
    // This will add to global stores connections array
    // then the network stores will trigger their onConnectionsChange
    // to create the edge shown here
  }

  if (nodes.length === 0) {
    return (
      <div className="flex h-[800px] w-full items-center justify-center">
        <h1 className="text-3xl text-gray-500">
          No statements or connections, please upload a statements file or load
          the example.
        </h1>
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      connectionLineComponent={ConnectionLine}
      isValidConnection={(connection) => {
        const source = nodes.find((node) => node.id === connection.source);
        const target = nodes.find((node) => node.id === connection.target);
        if (!source || !target) {
          throw new Error("Source or target node not found");
        }
        return (
          connection.sourceHandle === connection.targetHandle &&
          source.id !== target.id
        );
      }}
      fitView
      colorMode={theme}
      proOptions={{ hideAttribution: true }}
      onlyRenderVisibleElements={nodes.length > MAX_VISIBLE_STATEMENTS}
    >
      <Controls />
      <MyMiniMap />
    </ReactFlow>
  );
}
