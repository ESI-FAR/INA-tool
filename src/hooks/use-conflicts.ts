import { Conflict, Statement } from "@/lib/schema";
import { store, Store } from "@/stores/global";
import { useCallback, useMemo } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { useStatementLookup } from "./use-statements";

export function useConflicts() {
  const conflicts = useStore(
    store,
    useShallow<Store, Conflict[]>((state) => state.conflicts),
  );
  const setConflicts = store.getState().setConflicts;

  const removeConflicts = useCallback(
    (conflictsToRemove: Conflict[]) => {
      return setConflicts(
        conflicts.filter(
          (c) => !conflictsToRemove.some((c2) => c.group === c2.group),
        ),
      );
    },
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
  group: string;
  statements: Set<string>;
  fullStatements: Statement[];
}

export function useConflictsWithStatements(): ConflictWithStatements[] {
  const { conflicts } = useConflicts();
  const statementLookup = useStatementLookup();
  return useMemo(() => {
    return conflicts.map((conflict) => ({
      ...conflict,
      fullStatements: Array.from(conflict.statements).map(
        (statementId) => statementLookup.get(statementId)!,
      ),
    }));
  }, [conflicts, statementLookup]);
}

export interface GroupedStatementPair {
  group: string;
  source: string;
  target: string;
}
// TODO move to better place?
export function* conflictAsStatementPairs(
  conflicts: Conflict[],
): Generator<GroupedStatementPair, void, unknown> {
  for (const conflict of conflicts) {
    for (const source of conflict.statements) {
      for (const target of conflict.statements) {
        if (source < target) {
          const pair: GroupedStatementPair = {
            group: conflict.group,
            source,
            target,
          };
          yield pair;
        }
      }
    }
  }
}
