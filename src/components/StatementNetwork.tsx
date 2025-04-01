import { store } from "@/stores/statement-network";
import { Controls, ReactFlow } from "@xyflow/react";
import { Connection as ReactFlowConnection } from "@xyflow/react";
import { useStore } from "zustand";
import { useTheme } from "./theme-provider";
import { SourcePicker } from "./SourcePicker";
import { useState } from "react";
import { ConnectionLine } from "./ConnectionLine";
import {
  ActorDrivenConnection,
  ConflictingEdge,
  OutcomeDrivenConnection,
  SanctionDrivenConnection,
} from "./edges";
import "@xyflow/react/dist/style.css";
import { CollapsedStatementNode } from "./nodes";
import { useConnections } from "@/hooks/use-connections";
import { ConnectionWithValues } from "@/lib/schema";
import { reactFlowConnection2PossibleConnections } from "../lib/possibleConnections";
import { MyMiniMap } from "./MyMiniMap";
import { SelectedNodeToolbar } from "./SelectedNodeToolbar";

const nodeTypes = {
  statement: CollapsedStatementNode,
} as const;

const edgeTypes = {
  actor: ActorDrivenConnection,
  outcome: OutcomeDrivenConnection,
  sanction: SanctionDrivenConnection,
  conflict: ConflictingEdge,
} as const;

const MAX_VISIBLE_STATEMENTS = 500;

export function StatementNetwork() {
  const { theme } = useTheme();
  const { addConnection } = useConnections();

  const { nodes, edges, onNodesChange, onEdgesChange } = useStore(store);
  const [possibleConnections, setPossibleConnections] = useState<
    ConnectionWithValues[]
  >([]);

  function onConnectStart(connection: ReactFlowConnection) {
    const connections = reactFlowConnection2PossibleConnections(connection);
    if (connections.length > 1) {
      setPossibleConnections(connections);
    } else if (connections.length === 1) {
      addConnection(connections[0]);
    } else {
      throw new Error("No possible connections");
    }
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
    <>
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
        onlyRenderVisibleElements={nodes.length > MAX_VISIBLE_STATEMENTS}
      >
        <Controls />
        <MyMiniMap />
      </ReactFlow>
      {possibleConnections.length ? (
        <SourcePicker
          choices={possibleConnections}
          onPick={addConnection}
          onCancel={() => setPossibleConnections([])}
        />
      ) : null}
      <SelectedNodeToolbar />
    </>
  );
}
