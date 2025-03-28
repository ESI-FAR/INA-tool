import { Position, ReactFlowState, useStore } from "@xyflow/react";
import { useMemo } from "react";
import { shallow } from "zustand/shallow";

const selector = (s: ReactFlowState) =>
  s.nodesDraggable || s.nodesConnectable || s.elementsSelectable;
export function useIsInteractive() {
  return useStore(selector, shallow);
}

interface EndPoints {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
}

export function usePathEndpoints(endpoints: EndPoints, handleSize: number) {
  const isInteractive = useIsInteractive();
  const positions = useMemo(
    () => unpadHandle(endpoints, isInteractive, handleSize),
    [endpoints, isInteractive, handleSize],
  );

  return positions;
}

/**
 * When not interactive, remove the space for the handle from the source and target positions
 * to make the edge connect flush to the node's border.
 */
function unpadHandle(
  {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  }: EndPoints,
  isInteractive: boolean,
  handleSize: number,
) {
  let sx = sourceX;
  let sy = sourceY;
  if (!isInteractive) {
    if (sourcePosition === Position.Right) {
      sx -= handleSize;
    } else if (sourcePosition === Position.Left) {
      sx += handleSize;
    } else if (sourcePosition === Position.Top) {
      sy += handleSize;
    } else if (sourcePosition === Position.Bottom) {
      sy -= handleSize;
    }
  }
  let tx = targetX;
  let ty = targetY;
  if (!isInteractive) {
    if (targetPosition === Position.Right) {
      tx -= handleSize;
    } else if (targetPosition === Position.Left) {
      tx += handleSize;
    } else if (targetPosition === Position.Top) {
      ty += handleSize;
    } else if (targetPosition === Position.Bottom) {
      ty -= handleSize;
    }
  }
  return {
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
    sourcePosition,
    targetPosition,
  };
}
