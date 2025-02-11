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

export function ConflictingEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
}: EdgeProps<ConflictingEdge>) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return <BaseEdge id={id} path={edgePath} />;
}

// eslint-disable-next-line react-refresh/only-export-components
export const edgeTypes = {
  component: ComponentEdge,
  "actor-driven": ActorDrivenConnection,
  "outcome-driven": OutcomeDrivenConnection,
  "sanction-driven": SanctionDrivenConnection,
} as const;
