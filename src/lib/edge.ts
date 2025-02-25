import { MarkerType, type Edge } from "@xyflow/react";
import { DrivenBy } from "./schema";

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

export type ComponentEdge = Edge<
  { label?: string; statementId: string },
  "component"
>;
export type ActorDrivenConnection = Edge<Record<string, unknown>, "actor">; // Purple
export type OutcomeDrivenConnection = Edge<Record<string, unknown>, "outcome">; // Green
export type SanctionDrivenConnection = Edge<
  Record<string, unknown>,
  "sanction"
>; // Red

export type ConflictingEdge = Edge<Record<string, unknown>, "conflict">;

export type DrivenConnectionEdge =
  | ActorDrivenConnection
  | OutcomeDrivenConnection
  | SanctionDrivenConnection;

// Edges used in statement level network
export type INASEdge = DrivenConnectionEdge | ConflictingEdge;
// Edges used in component level network
export type INACEdge = DrivenConnectionEdge | ComponentEdge;

export function isComponentEdge(edge: INACEdge): edge is ComponentEdge {
  return edge.type === "component";
}

export function isDrivenConnectionEdge(
  edge: INACEdge | ConflictingEdge,
): edge is DrivenConnectionEdge {
  return (
    edge.type === "actor" || edge.type === "outcome" || edge.type === "sanction"
  );
}

export function isConflictingEdge(edge: INASEdge): edge is ConflictingEdge {
  return edge.type === "conflict";
}

export function connectionMarkerEnd(type: keyof typeof drivenColors) {
  return {
    type: MarkerType.Arrow,
    width: 10,
    height: 10,
    color: drivenColors[type],
  };
}

export function builderDrivenConnectionEdge(
  id: string,
  sourceId: string,
  targetId: string,
  type: DrivenBy,
): DrivenConnectionEdge {
  return {
    id: `${id}-${sourceId}-2-${targetId}`,
    source: sourceId,
    target: targetId,
    type,
    markerEnd: connectionMarkerEnd(type),
    sourceHandle: type,
    targetHandle: type,
  };
}

export const drivenColors = {
  component: "#000000",
  actor: "#a855f7",
  outcome: "#22c55e",
  sanction: "#ef4444",
} as const;

export function isDrivenConnection(
  edge: INACEdge,
): edge is DrivenConnectionEdge {
  return (
    edge.type === "actor" || edge.type === "outcome" || edge.type === "sanction"
  );
}
