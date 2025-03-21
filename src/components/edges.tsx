import { usePathEndpoints } from "@/hooks/use-interactive";
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

const COMPONENT_HANDLE_SIZE = 4;
const DRIVEN_CONNECTION_HANDLE_SIZE = 5;
const CONFLICT_HANDLE_SIZE = 4;

export function ComponentEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  sourcePosition,
  targetPosition,
}: EdgeProps<ComponentEdge>) {
  const endpoints = usePathEndpoints(
    {
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    },
    COMPONENT_HANDLE_SIZE,
  );
  const [edgePath, labelX, labelY] = getStraightPath(endpoints);

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
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
}: EdgeProps<ActorDrivenConnection>) {
  const endpoints = usePathEndpoints(
    {
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    },
    DRIVEN_CONNECTION_HANDLE_SIZE,
  );
  const [edgePath] = getSmoothStepPath(endpoints);

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
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
}: EdgeProps<OutcomeDrivenConnection>) {
  const endpoints = usePathEndpoints(
    {
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    },
    DRIVEN_CONNECTION_HANDLE_SIZE,
  );
  const [edgePath] = getSmoothStepPath(endpoints);

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
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
}: EdgeProps<SanctionDrivenConnection>) {
  const endpoints = usePathEndpoints(
    {
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    },
    DRIVEN_CONNECTION_HANDLE_SIZE,
  );
  const [edgePath] = getSmoothStepPath(endpoints);

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
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
}: EdgeProps<ConflictingEdge>) {
  const endpoints = usePathEndpoints(
    {
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    },
    CONFLICT_HANDLE_SIZE,
  );
  const [edgePath] = getSmoothStepPath({
    ...endpoints,
    sourcePosition,
    targetPosition,
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
