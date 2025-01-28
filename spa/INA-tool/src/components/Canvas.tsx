import { store } from "@/lib/store";
import { useStore } from "zustand";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  Connection,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "./nodes";
import { drivenColors, edgeTypes, INAEdge } from "./edges";
import { useTheme } from "./theme-provider";
import { ScreenshotButton } from "./ScreenshotButton";
import { LayoutButton } from "./LayoutButton";
import { ConnectionLine } from "./ConnectionLine";
import { CanvasLegendButton } from "./CanvasLegendButton";

function createEdgeFromConnection(connection: Connection): Connection {
  const type = connection.targetHandle as keyof typeof edgeTypes;
  if (type) {
    const nedge: INAEdge = {
      type,
      id: `${connection.source}-${connection.target}`,
      target: connection.target,
      source: connection.source,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      markerEnd: {
        type: MarkerType.Arrow,
        width: 10,
        height: 10,
        color: drivenColors[type as keyof typeof drivenColors],
      },
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
          isValidConnection={(connection) => {
            const source = nodes.find((node) => node.id === connection.source)!;
            const target = nodes.find((node) => node.id === connection.target)!;
            return (
              connection.sourceHandle === connection.targetHandle &&
              source.parentId !== target.parentId
            );
          }}
          fitView
          colorMode={theme}
          proOptions={{ hideAttribution: true }}
        >
          <Panel position="top-right" className="flex gap-1">
            {/* TODO add search, clicking hit should set viewport to node/edge */}
            {/* TODO add toggle to render statement node in compact mode, with statement as sentence
             and snippet in sentence with connections somehow visualized */}
            <LayoutButton />
            <ScreenshotButton />
            <CanvasLegendButton />
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
