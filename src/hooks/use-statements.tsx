import { deriveStatements } from "@/lib/io";
import { Statement } from "@/lib/schema";
import { Store, store } from "@/lib/store";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";

export function useStatements() {
  const stripper = useShallow<Store, Statement[]>((state) => {
    const statements = deriveStatements(state.nodes);
    statements.sort((a, b) => a.Id!.localeCompare(b.Id!));
    return statements;
  });
  return useStore(store, stripper);
}
