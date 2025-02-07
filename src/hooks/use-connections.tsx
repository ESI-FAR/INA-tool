import { Connection, ConnectionWithValues, Statement } from "@/lib/schema";
import { Store, store } from "@/lib/store";
import { useCallback, useMemo } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { useStatements } from "./use-statements";
import { internal2col } from "@/lib/io";

function compareConnection(a: Connection, b: Connection): boolean {
  return (
    a.source_statement === b.source_statement &&
    a.source_node === b.source_node &&
    a.target_statement === b.target_statement &&
    a.target_node === b.target_node &&
    a.driver === b.driver
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
  return { connections, removeConnection, addConnection };
}

export function useConnectionsWithValues(): ConnectionWithValues[] {
  const { connections } = useConnections();
  const { statements } = useStatements();
  return useMemo(() => {
    const statementLookup = new Map<string, Statement>(
      statements.map((statement) => [statement.Id!, statement]),
    );
    return connections.map((connection) => {
      const sourceStatement = statementLookup.get(connection.source_statement)!;
      const source_col = internal2col.get(
        connection.source_node,
      ) as keyof Statement;
      const source_value = sourceStatement[source_col]!;
      const targetStatement = statementLookup.get(connection.target_statement)!;
      const target_col = internal2col.get(
        connection.target_node,
      ) as keyof Statement;
      const target_value = targetStatement[target_col]!;
      return {
        ...connection,
        source_value,
        target_value,
      };
    });
  }, [connections, statements]);
}
