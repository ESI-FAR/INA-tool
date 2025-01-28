import {
  BaseEdge,
  Edge,
  EdgeProps,
  getBezierPath,
  getStraightPath,
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

export type DrivenConnection =
  | ActorDrivenConnection
  | OutcomeDrivenConnection
  | SanctionDrivenConnection;

export type INAEdge = InnerStatementEdge | DrivenConnection;

export function InnerStatementEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps<InnerStatementEdge>) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return <BaseEdge id={id} path={edgePath} label={data?.label} />;
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
