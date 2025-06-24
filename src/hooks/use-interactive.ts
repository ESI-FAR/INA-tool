import { ReactFlowState, useStore } from "@xyflow/react";
import { shallow } from "zustand/shallow";

const selector = (s: ReactFlowState) =>
  s.nodesDraggable || s.nodesConnectable || s.elementsSelectable;

export function useIsInteractive() {
  return useStore(selector, shallow);
}
