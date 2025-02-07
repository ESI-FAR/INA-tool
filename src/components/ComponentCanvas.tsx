import { useStore } from "zustand";
import { useTheme } from "./theme-provider";
import { store } from "@/lib/graph-store/component";
import {
  Connection as ReactFlowConnection,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
} from "@xyflow/react";
import { CanvasLegendButton } from "./CanvasLegendButton";
import { ConnectionLine } from "./ConnectionLine";
import { edgeTypes } from "./edges";
import { nodeTypes } from "./nodes";
import { CanvasSearch } from "./CanvasSearch";
import "@xyflow/react/dist/style.css";
import { useConnections } from "@/hooks/use-connections";
import { Connection } from "@/lib/schema";

function mapReactFlowConnectionToINAConnection(
  connection: ReactFlowConnection,
): Connection {
  const nodes = store.getState().nodes;
  const sourceNode = nodes.find((node) => node.id === connection.source)!;
  const targetNode = nodes.find((node) => node.id === connection.target)!;
  debugger;
  return {
    source_statement: sourceNode.parentId!,
    source_node: connection.sourceHandle,
    target_statement: targetNode.parentId!,
    target_node: connection.targetHandle,
    driver: connection.targetHandle,
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
        <h1 className="text-xl">Canvas</h1>
        <CanvasSearch />
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
          <Panel position="top-right" className="flex gap-1">
            {/* <LayoutButton />
                      <ScreenshotButton /> */}

            <CanvasLegendButton />
          </Panel>
          <Controls />
          <MiniMap pannable={true} />
        </ReactFlow>
      </div>
    </div>
  );
}
