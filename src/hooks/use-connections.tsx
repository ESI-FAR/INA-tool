import type {
  Connection,
  ConnectionComponent,
  ConnectionWithValues,
  Statement,
} from "@/lib/schema";
import { Store, store } from "@/stores/global";
import { useCallback, useMemo } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { useStatementLookup } from "./use-statements";
import {
  compareConnection,
  removeKnownConnections,
} from "@/lib/connectionHelpers";

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

  const addConnections = useCallback(
    (connectionsToAdd: Connection[]) => {
      const connectionsToAddFiltered = removeKnownConnections(
        connectionsToAdd,
        connections,
      );
      setConnections([...connections, ...connectionsToAddFiltered]);
    },
    [connections, setConnections],
  );

  const addConnection = useCallback(
    (connection: Connection) => {
      addConnections([connection]);
    },
    [addConnections],
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
    addConnections,
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
        };
      })
      .filter((c) => c !== undefined);
  }, [connections, statementLookup]);
}

export type ConnectionWithStatementObjects = {
  source_statement_object: Statement;
  target_statement_object: Statement;
} & Connection;

export function useConnectionWithStatementObjects(
  connections: Connection[],
): ConnectionWithStatementObjects[] {
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
        const targetStatement = statementLookup.get(
          connection.target_statement,
        );
        if (targetStatement === undefined) {
          return undefined;
        }
        return {
          ...connection,
          source_statement_object: sourceStatement,
          target_statement_object: targetStatement,
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
        };
      })
      .filter((c) => c !== undefined);
  }, [connections, statementId, statementLookup]);
}
