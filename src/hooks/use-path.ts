import type { Bends } from "@/lib/edge";
import { Position, getSmoothStepPath } from "@xyflow/react";
import { useMemo } from "react";
import { useIsInteractive } from "./use-interactive";

export interface EndPoints {
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

function getBendyPath(points: Bends): [string, number, number] {
  let pathData = `M${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    pathData += ` L${points[i][0]},${points[i][1]}`;
  }

  let centerX = (points[0][0] + points[points.length - 1][0]) / 2;
  let centerY = (points[0][1] + points[points.length - 1][1]) / 2;
  const middleIndex = Math.floor(points.length / 2);
  if (points.length % 2 === 0) {
    // If even then odd line segments -> use middle of middle line
    centerX = (points[middleIndex - 1][0] + points[middleIndex][0]) / 2;
    centerY = (points[middleIndex - 1][1] + points[middleIndex][1]) / 2;
  } else {
    // If odd then even line segments -> use middle corner
    centerX = points[middleIndex][0];
    centerY = points[middleIndex][1];
  }
  return [pathData, centerX, centerY];
}

function getBendyPathMaybe(
  bends: Bends | undefined,
  newEndpoints: EndPoints,
  handleEndpoints: EndPoints | undefined,
) {
  let edgePath = "";
  let labelX = 0;
  let labelY = 0;
  if (bends !== undefined && Array.isArray(bends)) {
    if (handleEndpoints === undefined) {
      [edgePath, labelX, labelY] = getBendyPath([
        [newEndpoints.sourceX, newEndpoints.sourceY],
        ...bends,
        [newEndpoints.targetX, newEndpoints.targetY],
      ]);
    } else {
      // When non-interactive we replace handle oclusion with a extra line segment
      // otherwise we get a non-orthogonal path.
      [edgePath, labelX, labelY] = getBendyPath([
        [newEndpoints.sourceX, newEndpoints.sourceY],
        [handleEndpoints.sourceX, handleEndpoints.sourceY],
        ...bends,
        [handleEndpoints.targetX, handleEndpoints.targetY],
        [newEndpoints.targetX, newEndpoints.targetY],
      ]);
    }
  } else {
    [edgePath, labelX, labelY] = getSmoothStepPath(newEndpoints);
  }
  return { edgePath, labelX, labelY };
}

export function useBendyPath(
  endpoints: EndPoints,
  bends: Bends | undefined,
  handleSize: number,
) {
  const isInteractive = useIsInteractive();
  const { edgePath, labelX, labelY } = useMemo(() => {
    const newEndpoints = unpadHandle(endpoints, isInteractive, handleSize);
    return getBendyPathMaybe(
      bends,
      newEndpoints,
      !isInteractive ? endpoints : undefined,
    );
  }, [endpoints, isInteractive, handleSize, bends]);
  return { edgePath, labelX, labelY };
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
