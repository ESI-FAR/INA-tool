import { store } from "@/lib/graph-store/statement";
import { Connection, Controls, MiniMap, Panel, ReactFlow } from "@xyflow/react";
import { useStore } from "zustand";
import { useTheme } from "./theme-provider";
import { CanvasLegendButton } from "./CanvasLegendButton";
import { hasAmbiguousSource, SourcePicker } from "./SourcePicker";
import { useState } from "react";
import { buildEdge, INACompactEdge } from "@/lib/edge";
import { ConnectionLine } from "./ConnectionLine";
import {
  ActorDrivenConnection,
  ConflictingEdge,
  OutcomeDrivenConnection,
  SanctionDrivenConnection,
} from "./edges";
import "@xyflow/react/dist/style.css";
import { CollapsedStatementNode } from "./nodes";

const nodeTypes = {
  statement: CollapsedStatementNode,
} as const;

const edgeTypes = {
  "actor-driven": ActorDrivenConnection,
  "outcome-driven": OutcomeDrivenConnection,
  "sanction-driven": SanctionDrivenConnection,
  conflict: ConflictingEdge,
} as const;

function createEdgeFromConnection(connection: Connection): INACompactEdge {
  const type = connection.targetHandle as keyof typeof edgeTypes;
  if (type) {
    const nedge = buildEdge(connection.source, connection.target, type);
    return nedge as INACompactEdge;
  }
  return connection as INACompactEdge;
}

export function StatementCanvas() {
  const { theme } = useTheme();

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useStore(store);
  const [pendingConnection, setPendingConnection] = useState<
    Connection | undefined
  >(undefined);

  function onConnectStart(connection: Connection) {
    debugger;
    if (hasAmbiguousSource(connection, nodes)) {
      setPendingConnection(connection);
      return;
    }
    const edge = createEdgeFromConnection(connection);
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
          return (
            connection.sourceHandle === connection.targetHandle &&
            connection.source !== connection.target
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
      {pendingConnection && (
        <SourcePicker
          connection={pendingConnection}
          onPick={pickSource}
          onCancel={() => setPendingConnection(undefined)}
        />
      )}
    </div>
  );
}
