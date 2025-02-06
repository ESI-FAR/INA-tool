import { MarkerType, type Edge } from "@xyflow/react";

/*
Connections:
Purple (Actor-driven connection):
- (Animate) Direct/Indirect Object -> Attribute
- Execution Constraint -> Attribute

Green (Outcome-driven connection):
- (Inanimate) Direct/Indirect Object -> Activation Condition

Red (Sanction-driven connection):
- Aim -> Activation Condition
*/

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

export function isInnerStatementEdge(
  edge: INAEdge,
): edge is InnerStatementEdge {
  return edge.type === "inner-statement";
}

export function isDrivenConnectionEdge(
  edge: INAEdge,
): edge is DrivenConnection {
  return !isInnerStatementEdge(edge);
}

function connectionMarkerEnd(type: keyof typeof drivenColors) {
  return {
    type: MarkerType.Arrow,
    width: 10,
    height: 10,
    color: drivenColors[type],
  };
}

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

export const drivenColors = {
  "inner-statement": "#000000",
  "actor-driven": "#a855f7",
  "outcome-driven": "#22c55e",
  "sanction-driven": "#ef4444",
} as const;

export function isDrivenConnection(edge: INAEdge): edge is DrivenConnection {
  return (
    edge.type === "actor-driven" ||
    edge.type === "outcome-driven" ||
    edge.type === "sanction-driven"
  );
}
