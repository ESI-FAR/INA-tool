import { Statement } from "@/lib/schema";
import { Store, store } from "@/stores/global";
import { useCallback } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";

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

  const deleteStatement = useCallback(
    (id: string) => {
      setStatements(statements.filter((s) => s.Id !== id));
    },
    [statements, setStatements],
  );

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
    deleteStatement,
    updateStatement,
  };
}
