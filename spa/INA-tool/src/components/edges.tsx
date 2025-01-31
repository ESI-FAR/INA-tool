import {
  BaseEdge,
  Edge,
  EdgeProps,
  getBezierPath,
  getStraightPath,
  MarkerType,
} from "@xyflow/react";

export type InnerStatementEdge = Edge<{ label?: string }, "inner-statement">;
export type ActorDrivenConnection = Edge<
  Record<string, unknown>,
  "actor-driven"
>; // Purple
export type OutcomeDrivenConnection = Edge<
  Record<string, unknown>,
  "outcome-driven"
>; // Green
export type SanctionDrivenConnection = Edge<
  Record<string, unknown>,
  "sanction-driven"
>; // Red

export type DrivenConnection = (
  | ActorDrivenConnection
  | OutcomeDrivenConnection
  | SanctionDrivenConnection
) & { uncompactSource?: string; uncompactTarget?: string };

export type INAEdge = InnerStatementEdge | DrivenConnection;

// eslint-disable-next-line react-refresh/only-export-components
export function isInnerStatementEdge(
  edge: INAEdge,
): edge is InnerStatementEdge {
  return edge.type === "inner-statement";
}

// eslint-disable-next-line react-refresh/only-export-components
export function isDrivenConnectionEdge(
  edge: INAEdge,
): edge is DrivenConnection {
  return !isInnerStatementEdge(edge);
}

export function InnerStatementEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
}: EdgeProps<InnerStatementEdge>) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      labelX={labelX}
      labelY={labelY}
      label={label}
    />
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const drivenColors = {
  "inner-statement": "#000000",
  "actor-driven": "#a855f7",
  "outcome-driven": "#22c55e",
  "sanction-driven": "#ef4444",
} as const;

const actorDrivenStyle = {
  stroke: drivenColors["actor-driven"],
  strokeWidth: 2,
};

export function ActorDrivenConnection({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
}: EdgeProps<ActorDrivenConnection>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={actorDrivenStyle}
      markerEnd={markerEnd}
    />
  );
}

const outcomeDrivenStyle = {
  stroke: drivenColors["outcome-driven"],
  strokeWidth: 2,
};

export function OutcomeDrivenConnection({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
}: EdgeProps<OutcomeDrivenConnection>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={outcomeDrivenStyle}
      markerEnd={markerEnd}
    />
  );
}

const sactionDrivenStyle = {
  stroke: drivenColors["sanction-driven"],
  strokeWidth: 2,
};

export function SanctionDrivenConnection({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
}: EdgeProps<SanctionDrivenConnection>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={sactionDrivenStyle}
      markerEnd={markerEnd}
    />
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const edgeTypes = {
  "inner-statement": InnerStatementEdge,
  "actor-driven": ActorDrivenConnection,
  "outcome-driven": OutcomeDrivenConnection,
  "sanction-driven": SanctionDrivenConnection,
} as const;

function connectionMarkerEnd(type: keyof typeof edgeTypes) {
  return {
    type: MarkerType.Arrow,
    width: 10,
    height: 10,
    color: drivenColors[type],
  };
}

// eslint-disable-next-line react-refresh/only-export-components
export function buildEdge(
  sourceId: string,
  targetId: string,
  type: Exclude<INAEdge["type"], undefined>,
): INAEdge {
  return {
    id: `${sourceId}-2-${targetId}`,
    source: sourceId,
    target: targetId,
    type,
    markerEnd: connectionMarkerEnd(type),
    sourceHandle: type,
    targetHandle: type,
  };
}
