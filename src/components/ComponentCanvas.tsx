import { useStore } from "zustand";
import { useTheme } from "./theme-provider";
import { store } from "@/lib/graph-store/component";
import {
  Connection as ReactFlowConnection,
  Controls,
  ReactFlow,
} from "@xyflow/react";
import { CanvasLegendButton } from "./CanvasLegendButton";
import { ConnectionLine } from "./ConnectionLine";
import { edgeTypes } from "./edges";
import { nodeTypes } from "./nodes";
import { ComponentCanvasSearchButton } from "./CanvasSearch";
import "@xyflow/react/dist/style.css";
import { useConnections } from "@/hooks/use-connections";
import {
  Connection,
  DriverType,
  SourceNodeType,
  TargetNodeType,
} from "@/lib/schema";
import { ComponentLayoutButton } from "./LayoutButton";
import { ScreenshotButton } from "./ScreenshotButton";
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
    source_node: SourceNodeType.parse(sourceNode.type),
    target_statement: targetNode.parentId,
    target_node: TargetNodeType.parse(targetNode.type),
    driver: DriverType.parse(connection.targetHandle.replace("-driven", "")),
  };
}

export function ComponentCanvas() {
  const { theme } = useTheme();
  const { nodes, edges, onNodesChange, onEdgesChange } = useStore(store);
  const { addConnection } = useConnections();

  function onConnect(connection: ReactFlowConnection) {
    addConnection(mapReactFlowConnectionToINAConnection(connection));
    // This will add to global stores connections array
    // then the componentGraphStore and statementGraphStore will trigger their onConnectionsChange
    // to create the edge shown in this canvas
  }

  if (nodes.length === 0) {
    return (
      <div className="flex h-[800px] w-full items-center justify-center">
        <h1 className="text-3xl text-gray-500">
          No statements, please upload a statements file or load the example.
        </h1>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex justify-between">
        <h1 className="text-xl">Component level network</h1>
        <div className="flex gap-1">
          <ComponentCanvasSearchButton />
          <ComponentLayoutButton />
          <ScreenshotButton />
          <CanvasLegendButton />
        </div>
      </div>
      <div className="h-full w-full">
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
            const source = nodes.find((node) => node.id === connection.source)!;
            const target = nodes.find((node) => node.id === connection.target)!;
            return (
              connection.sourceHandle === connection.targetHandle &&
              source.id !== target.id
            );
          }}
          fitView
          colorMode={theme}
          proOptions={{ hideAttribution: true }}
        >
          <Controls />
          <MyMiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}
