import { Connection, Statement } from "@/lib/schema";
import { Store, store } from "@/stores/global";
import { useCallback, useMemo } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { useConnections } from "./use-connections";

export function useStatements() {
  const statements = useStore(
    store,
    useShallow<Store, Statement[]>((state) => state.statements),
  );
  const setStatements = store.getState().setStatements;
  const createFreshStatement = useCallback(() => {
    let newId = statements.length;
    // If id already exists, increment until it doesn't
    while (statements.some((s) => s.Id === newId.toString())) {
      newId++;
    }
    const newStatement: Statement = {
      Id: newId.toString(),
      "Statement Type": "formal",
      Attribute: "",
      Deontic: "",
      Aim: "",
      "Direct Object": "",
      "Type of Direct Object": "",
      "Indirect Object": "",
      "Type of Indirect Object": "",
      "Activation Condition": "",
      "Execution Constraint": "",
      "Or Else": "",
    };
    setStatements([...statements, newStatement]);
    return newStatement;
  }, [statements, setStatements]);

  const updateStatement = useCallback(
    (newStatement: Statement) => {
      setStatements(
        statements.map((s) => (s.Id === newStatement.Id ? newStatement : s)),
      );
    },
    [setStatements, statements],
  );
  return {
    statements,
    createFreshStatement,
    updateStatement,
  };
}

/**
 * Hook to delete statements by their identifiers and any connections to them.
 */
export function useStatementDeleter() {
  const { statements } = useStatements();
  const { connectionsOfStatement, removeConnections } = useConnections();
  const removeStatements = useCallback(
    (ids: string[]) => {
      const connections2delete: Connection[] = [];
      for (const id of ids) {
        // Check statement is unconnected
        const connections = connectionsOfStatement(id);
        if (connections.length > 0) {
          // If statement is connected, ask for confirmation and remove connection as well
          if (
            window.confirm(
              `Statement ${id} is connected to other statement(s). Deleting it will also delete those connections. Are you sure you want to delete it?`,
            )
          ) {
            connections2delete.push(...connections);
          } else {
            return;
          }
        } else {
          if (
            !window.confirm(`Are you sure you want to delete statement ${id}?`)
          ) {
            return;
          }
        }
      }
      const setStatements = store.getState().setStatements;
      setStatements(statements.filter((s) => !ids.includes(s.Id)));
      removeConnections(connections2delete);
    },
    [statements, removeConnections, connectionsOfStatement],
  );
  return removeStatements;
}

export function useStatementLookup(): Map<string, Statement> {
  const { statements } = useStore(store);
  const statementLookup = useMemo(
    () =>
      new Map<string, Statement>(
        statements.map((statement) => [statement.Id, statement]),
      ),
    [statements],
  );
  return statementLookup;
}
