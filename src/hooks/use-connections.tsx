import {
  Connection,
  ConnectionComponent,
  ConnectionWithValues,
} from "@/lib/schema";
import { Store, store } from "@/stores/global";
import { useCallback, useMemo } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { useStatementLookup } from "./use-statements";
import { statementLabel } from "@/lib/utils";

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
  const removeConnections = useCallback(
    (connectionsToRemove: Connection[]) => {
      setConnections(
        connections.filter(
          (c) => !connectionsToRemove.some((c2) => compareConnection(c, c2)),
        ),
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
    removeConnections,
    addConnection,
    connectionsOfStatement,
    connectionsOfComponent,
  };
}

export function useConnectionsWithValues(): ConnectionWithValues[] {
  const { connections } = useConnections();
  const statementLookup = useStatementLookup();
  return useMemo(() => {
    return connections
      .map((connection) => {
        const sourceStatement = statementLookup.get(
          connection.source_statement,
        );
        if (sourceStatement === undefined) {
          return undefined;
        }
        const source_col = connection.source_component;
        if (!sourceStatement[source_col]) {
          return undefined;
        }
        const source_value = sourceStatement[source_col];
        const targetStatement = statementLookup.get(
          connection.target_statement,
        );
        if (targetStatement === undefined) {
          return undefined;
        }
        const target_col = connection.target_component;
        if (!targetStatement[target_col]) {
          return undefined;
        }
        const target_value = targetStatement[target_col];
        return {
          ...connection,
          source_value,
          target_value,
          source_statement: statementLabel(sourceStatement),
          target_statement: statementLabel(targetStatement),
        };
      })
      .filter((c) => c !== undefined);
  }, [connections, statementLookup]);
}

export function useConnectionsWithValuesOfStatement(
  statementId: string,
): ConnectionWithValues[] {
  const { connections } = useConnections();
  const statementLookup = useStatementLookup();
  return useMemo(() => {
    return connections
      .filter(
        (connection) =>
          connection.source_statement === statementId ||
          connection.target_statement === statementId,
      )
      .map((connection) => {
        const sourceStatement = statementLookup.get(
          connection.source_statement,
        );
        if (sourceStatement === undefined) {
          return undefined;
        }
        const source_col = connection.source_component;
        if (!sourceStatement[source_col]) {
          return undefined;
        }
        const source_value = sourceStatement[source_col];
        const targetStatement = statementLookup.get(
          connection.target_statement,
        );
        if (targetStatement === undefined) {
          return undefined;
        }
        const target_col = connection.target_component;
        if (!targetStatement[target_col]) {
          return undefined;
        }
        const target_value = targetStatement[target_col];
        return {
          ...connection,
          source_value,
          target_value,
          source_statement: statementLabel(sourceStatement),
          target_statement: statementLabel(targetStatement),
        };
      })
      .filter((c) => c !== undefined);
  }, [connections, statementId, statementLookup]);
}
