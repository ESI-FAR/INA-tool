import { useIsInteractive, usePathEndpoints } from "@/hooks/use-interactive";
import {
  type ComponentEdge,
  type ActorDrivenConnection,
  type OutcomeDrivenConnection,
  type SanctionDrivenConnection,
  drivenColors,
  type ConflictingEdge,
  DrivenConnectionEdge,
} from "@/lib/edge";
import {
  BaseEdge,
  EdgeProps,
  getStraightPath,
  getSmoothStepPath,
  EdgeLabelRenderer,
} from "@xyflow/react";
import { textColor } from "./drivenColors";
import { cn } from "@/lib/utils";
import { store } from "@/stores/global";
import { connection2id } from "@/lib/connection2id";
import { useCallback } from "react";
import { conflict2id } from "@/stores/component-network";
import { XIcon } from "lucide-react";

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

function deleteDrivenConnection(id: string) {
  const all = store.getState().connections;
  const newConnections = all.filter((c) => connection2id(c) !== id);
  store.getState().setConnections(newConnections);
}

function BaseEdgeWithDelete({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
  style,
  deleteClassName,
  onDelete = deleteDrivenConnection,
  handleSize = DRIVEN_CONNECTION_HANDLE_SIZE,
}: EdgeProps<DrivenConnectionEdge> & {
  deleteClassName: string;
  onDelete?: (id: string) => void;
  handleSize?: number;
}) {
  const endpoints = usePathEndpoints(
    {
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    },
    handleSize,
  );
  const isInteractive = useIsInteractive();
  const [edgePath, labelX, labelY] = getSmoothStepPath(endpoints);

  const deleteConnection = useCallback(() => {
    onDelete(id);
  }, [id, onDelete]);

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
      {isInteractive && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan absolute z-10 origin-center"
            style={{
              pointerEvents: "all",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
          >
            <button
              className={cn(
                "cursor-pointer rounded-full bg-background hover:bg-accent",
                deleteClassName,
              )}
              onClick={deleteConnection}
            >
              <XIcon size={12} />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const actorDrivenStyle = {
  stroke: drivenColors["actor"],
  strokeWidth: 2,
};

export function ActorDrivenConnection(props: EdgeProps<ActorDrivenConnection>) {
  return (
    <BaseEdgeWithDelete
      {...props}
      style={actorDrivenStyle}
      deleteClassName={textColor["actor"]}
    />
  );
}

const outcomeDrivenStyle = {
  stroke: drivenColors["outcome"],
  strokeWidth: 2,
};

export function OutcomeDrivenConnection(
  props: EdgeProps<SanctionDrivenConnection>,
) {
  return (
    <BaseEdgeWithDelete
      {...props}
      style={outcomeDrivenStyle}
      deleteClassName={textColor["outcome"]}
    />
  );
}

const sactionDrivenStyle = {
  stroke: drivenColors["sanction"],
  strokeWidth: 2,
};

export function SanctionDrivenConnection(
  props: EdgeProps<SanctionDrivenConnection>,
) {
  return (
    <BaseEdgeWithDelete
      {...props}
      style={sactionDrivenStyle}
      deleteClassName={textColor["sanction"]}
    />
  );
}

const conflictingStyle = {
  stroke: drivenColors["conflict"],
  strokeWidth: 1,
  strokeDasharray: "2",
};

function deleteConflictById(id: string) {
  const all = store.getState().conflicts;
  const newConflicts = all.filter((c) => conflict2id(c) !== id);
  store.getState().setConflicts(newConflicts);
}

export function ConflictingEdge(props: EdgeProps<ConflictingEdge>) {
  return (
    <BaseEdgeWithDelete
      {...props}
      style={conflictingStyle}
      deleteClassName="text-amber-500"
      handleSize={CONFLICT_HANDLE_SIZE}
      onDelete={deleteConflictById}
    />
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const edgeTypes = {
  component: ComponentEdge,
  actor: ActorDrivenConnection,
  outcome: OutcomeDrivenConnection,
  sanction: SanctionDrivenConnection,
  conflict: ConflictingEdge,
} as const;
