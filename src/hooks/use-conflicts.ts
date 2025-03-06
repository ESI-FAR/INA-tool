import { Conflict, Statement } from "@/lib/schema";
import { store, Store } from "@/stores/global";
import { useCallback, useMemo } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { useStatements } from "./use-statements";

export function useConflicts() {
  const conflicts = useStore(
    store,
    useShallow<Store, Conflict[]>((state) => state.conflicts),
  );
  const setConflicts = store.getState().setConflicts;

  const removeConflicts = useCallback(
    (conflictsToRemove: Conflict[]) =>
      setConflicts(conflicts.filter((c) => !conflictsToRemove.includes(c))),
    [conflicts, setConflicts],
  );

  const addConflict = useCallback(
    (conflict: Conflict) => setConflicts([...conflicts, conflict]),
    [conflicts, setConflicts],
  );
  return {
    conflicts,
    removeConflicts,
    addConflict,
  };
}

export interface ConflictWithStatements {
  formal: string;
  informal: string;
  formalStatement: Statement;
  informalStatement: Statement;
}

export function useConflictsWithStatements(): ConflictWithStatements[] {
  const { conflicts } = useConflicts();
  const { statements } = useStatements();
  return useMemo(() => {
    const statementLookup = new Map<string, Statement>(
      statements.map((statement) => [statement.Id, statement]),
    );
    return conflicts.map((conflict) => ({
      ...conflict,
      formalStatement: statementLookup.get(conflict.formal)!,
      informalStatement: statementLookup.get(conflict.informal)!,
    }));
  }, [conflicts, statements]);
}
