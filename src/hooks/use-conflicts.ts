import { Conflict } from "@/lib/schema";
import { store, Store } from "@/stores/global";
import { useCallback } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";

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
