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

const actorDrivenStyle = {
  stroke: "#a855f7",
  strokeWidth: 2,
};

export function ActorDrivenConnection({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
}: EdgeProps<ActorDrivenConnection>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  // TODO draw arrow at target handle?
  return <BaseEdge id={id} path={edgePath} style={actorDrivenStyle} />;
}

const outcomeDrivenStyle = {
  stroke: "#22c55e",
  strokeWidth: 2,
};

export function OutcomeDrivenConnection({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
}: EdgeProps<OutcomeDrivenConnection>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return <BaseEdge id={id} path={edgePath} style={outcomeDrivenStyle} />;
}

const sactionDrivenStyle = {
  stroke: "#ef4444",
  strokeWidth: 2,
};

export function SanctionDrivenConnection({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
}: EdgeProps<SanctionDrivenConnection>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return <BaseEdge id={id} path={edgePath} style={sactionDrivenStyle} />;
}

// eslint-disable-next-line react-refresh/only-export-components
export const edgeTypes = {
  "inner-statement": InnerStatementEdge,
  "actor-driven": ActorDrivenConnection,
  "outcome-driven": OutcomeDrivenConnection,
  "sanction-driven": SanctionDrivenConnection,
} as const;
