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
import { buildEdge, edgeTypes, INAEdge } from "./edges";
import { useTheme } from "./theme-provider";
import { ScreenshotButton } from "./ScreenshotButton";
import { LayoutButton } from "./LayoutButton";
import { ConnectionLine } from "./ConnectionLine";
import { CanvasLegendButton } from "./CanvasLegendButton";
import { CompactSwitch } from "./CompactSwitch";
import { useState } from "react";
import {
  hasAmbiguousSource,
  setUncompactSource,
  setUncompactTarget,
  SourcePicker,
} from "./SourcePicker";
import { CanvasSearch } from "./CanvasSearch";

function createEdgeFromConnection(connection: Connection): INAEdge {
  const type = connection.targetHandle as keyof typeof edgeTypes;
  if (type) {
    const nedge = buildEdge(connection.source, connection.target, type);
    return nedge;
  }
  return connection as INAEdge;
}

function Flow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useStore(store);
  const [pendingConnection, setPendingConnection] = useState<
    Connection | undefined
  >(undefined);
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

  function onConnectStart(connection: Connection) {
    if (hasAmbiguousSource(connection, nodes)) {
      setPendingConnection(connection);
      return;
    }
    const edge = createEdgeFromConnection(connection);
    if (store.getState().isCompact) {
      setUncompactSource(edge, nodes);
      setUncompactTarget(edge);
    }
    onConnect(edge as Connection);
  }

  function pickSource(uncompactSource: string, uncompactTarget: string) {
    if (pendingConnection) {
      const edge = createEdgeFromConnection(pendingConnection);
      onConnect({
        ...edge,
        uncompactSource,
        uncompactTarget,
      } as unknown as Connection);
      setPendingConnection(undefined);
    }
  }

  return (
    <div className="h-full">
      <div className="flex justify-between">
        <h1 className="text-xl">Statements</h1>
        <CanvasSearch />
      </div>
      <div className="h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnectStart}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionLineComponent={ConnectionLine}
          isValidConnection={(connection) => {
            const source = nodes.find((node) => node.id === connection.source)!;
            const target = nodes.find((node) => node.id === connection.target)!;
            const isCompact = store.getState().isCompact;
            return (
              connection.sourceHandle === connection.targetHandle &&
              ((isCompact && source.id !== target.id) ||
                (!isCompact && source.parentId !== target.parentId))
            );
          }}
          fitView
          colorMode={theme}
          proOptions={{ hideAttribution: true }}
        >
          <Panel position="top-right" className="flex gap-1">
            <CompactSwitch />
            <LayoutButton />
            <ScreenshotButton />
            <CanvasLegendButton />
          </Panel>
          <Controls />
          <MiniMap />
        </ReactFlow>
        {pendingConnection && (
          <SourcePicker
            connection={pendingConnection}
            onPick={pickSource}
            onCancel={() => setPendingConnection(undefined)}
          />
        )}
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
