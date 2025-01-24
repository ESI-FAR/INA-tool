import { store } from "@/lib/store";
import { useStore } from "zustand";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "./nodes";
import { edgeTypes, INAEdge } from "./edges";
import { useTheme } from "./theme-provider";
import { ScreenshotButton } from "./ScreenshotButton";
import { LayoutButton } from "./LayoutButton";
import { ConnectionLine } from "./ConnectionLine";

function createEdgeFromConnection(connection: Connection): Connection {
  const type = connection.targetHandle as keyof typeof edgeTypes;
  if (type) {
    const nedge: INAEdge = {
      id: `${connection.source}-${connection.target}`,
      target: connection.target,
      source: connection.source,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type,
    };
    return nedge as Connection;
  }
  return connection;
}

function Flow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useStore(store);

  const { theme } = useTheme();

  if (nodes.length === 0) {
    return (
      <div className="flex h-[800px] w-full items-center justify-center">
        <h1 className="text-3xl text-gray-500">
          No statements or connections, please upload a file or load the
          example.
        </h1>
      </div>
    );
  }

  return (
    <div className="h-full">
      <h1>Canvas</h1>
      <div className="h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={(c) => onConnect(createEdgeFromConnection(c))}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionLineComponent={ConnectionLine}
          isValidConnection={(connection) =>
            connection.sourceHandle === connection.targetHandle
          }
          fitView
          colorMode={theme}
          proOptions={{ hideAttribution: true }}
        >
          <Panel position="top-right" className="flex gap-1">
            <LayoutButton />
            <ScreenshotButton />
          </Panel>
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
