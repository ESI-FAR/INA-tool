import {
  Connection,
  ConnectionComponent,
  ConnectionWithValues,
  Statement,
} from "@/lib/schema";
import { Store, store } from "@/stores/global";
import { useCallback, useMemo } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { useStatements } from "./use-statements";
import { internal2col } from "@/lib/io";

function compareConnection(a: Connection, b: Connection): boolean {
  return (
    a.source_statement === b.source_statement &&
    a.source_component === b.source_component &&
    a.target_statement === b.target_statement &&
    a.target_component === b.target_component &&
    a.driven_by === b.driven_by
  );
}

export function useConnections() {
  const connections = useStore(
    store,
    useShallow<Store, Connection[]>((state) => state.connections),
  );
  const setConnections = store.getState().setConnections;
  const removeConnection = useCallback(
    (connection: Connection) => {
      setConnections(
        connections.filter((c) => !compareConnection(c, connection)),
      );
    },
    [connections, setConnections],
  );

  const addConnection = useCallback(
    (connection: Connection) => {
      // TODO check if connection already exists, if so show error
      setConnections([...connections, connection]);
    },
    [connections, setConnections],
  );

  const connectionsOfStatement = useCallback(
    (statementId: string) => {
      return connections.filter(
        (connection) =>
          connection.source_statement === statementId ||
          connection.target_statement === statementId,
      );
    },
    [connections],
  );
  const connectionsOfComponent = useCallback(
    (statementId: string, component: ConnectionComponent) => {
      return connections.filter(
        (connection) =>
          (connection.source_statement === statementId &&
            connection.source_component === component) ||
          (connection.target_statement === statementId &&
            connection.target_component === component),
      );
    },
    [connections],
  );
  return {
    connections,
    removeConnection,
    addConnection,
    connectionsOfStatement,
    connectionsOfComponent,
  };
}

export function useConnectionsWithValues(): ConnectionWithValues[] {
  const { connections } = useConnections();
  const { statements } = useStatements();
  return useMemo(() => {
    const statementLookup = new Map<string, Statement>(
      statements.map((statement) => [statement.Id!, statement]),
    );
    return connections
      .map((connection) => {
        const sourceStatement = statementLookup.get(
          connection.source_statement,
        );
        if (sourceStatement === undefined) {
          return undefined;
        }
        const source_col = internal2col.get(
          connection.source_component,
        ) as keyof Statement;
        const source_value = sourceStatement[source_col]!;
        const targetStatement = statementLookup.get(
          connection.target_statement,
        );
        if (targetStatement === undefined) {
          return undefined;
        }
        const target_col = internal2col.get(
          connection.target_component,
        ) as keyof Statement;
        const target_value = targetStatement[target_col]!;
        return {
          ...connection,
          source_value,
          target_value,
        };
      })
      .filter((c) => c !== undefined);
  }, [connections, statements]);
}
