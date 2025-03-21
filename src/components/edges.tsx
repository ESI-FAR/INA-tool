import {
  type ComponentEdge,
  type ActorDrivenConnection,
  type OutcomeDrivenConnection,
  type SanctionDrivenConnection,
  drivenColors,
  type ConflictingEdge,
} from "@/lib/edge";
import {
  BaseEdge,
  EdgeProps,
  getStraightPath,
  getSmoothStepPath,
  Position,
} from "@xyflow/react";

export function ComponentEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
}: EdgeProps<ComponentEdge>) {
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

const actorDrivenStyle = {
  stroke: drivenColors["actor"],
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
  const [edgePath] = getSmoothStepPath({
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
  stroke: drivenColors["outcome"],
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
  const [edgePath] = getSmoothStepPath({
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
  stroke: drivenColors["sanction"],
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
  const [edgePath] = getSmoothStepPath({
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

const conflictingStyle = {
  stroke: drivenColors["conflict"],
  strokeWidth: 1,
  strokeDasharray: "2",
};

export function ConflictingEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
}: EdgeProps<ConflictingEdge>) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  });

  return <BaseEdge id={id} path={edgePath} style={conflictingStyle} />;
}

// eslint-disable-next-line react-refresh/only-export-components
export const edgeTypes = {
  component: ComponentEdge,
  actor: ActorDrivenConnection,
  outcome: OutcomeDrivenConnection,
  sanction: SanctionDrivenConnection,
  conflict: ConflictingEdge,
} as const;
