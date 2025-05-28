import { useIsInteractive } from "@/hooks/use-interactive";
import { EndPoints, useBendyPath, usePathEndpoints } from "@/hooks/use-path";
import {
  type ComponentEdge,
  type ActorDrivenConnection,
  type OutcomeDrivenConnection,
  type SanctionDrivenConnection,
  drivenColors,
  type ConflictingEdge,
  DrivenConnectionEdge,
  Bends,
} from "@/lib/edge";
import {
  BaseEdge,
  EdgeProps,
  getStraightPath,
  EdgeLabelRenderer,
  useReactFlow,
} from "@xyflow/react";
import { textColor } from "./drivenColors";
import { cn } from "@/lib/utils";
import { store } from "@/stores/global";
import { connection2id } from "@/lib/connection2id";
import { useCallback } from "react";
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

function EditHandles({
  endpoints,
  bends,
  updateBends,
  handleSize = DRIVEN_CONNECTION_HANDLE_SIZE,
}: {
  endpoints: EndPoints;
  bends?: Bends;
  updateBends: (bends: Bends) => void;
  handleSize?: number;
}) {
  /*
   * <div class="nodrag nopan absolute z-10 origin-center" style="pointer-events: all; transform: translate(-50%, -50%) translate(433.654px, 182.84px);">
  <button class="cursor-pointer rounded-full bg-background hover:bg-accent text-purple-500">
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x">
  <path d="M18 6 6 18"></path>
  <path d="m6 6 12 12"></path>
  </svg>
  </button>
  </div>

  <circle tabindex="0" id="spline-b39a4ab5-ac24-4581-b038-aed4d596370c" 
  class="nopan nodrag" cx="76.5" cy="150" r="3" 
  stroke-opacity="0.3" stroke="#0375ff" 
  fill="white" style="pointer-events: all;">
  </circle>
   */
  if (bends === undefined) {
    return <></>;
  }
  return (
    <>
      {bends.map((bend, index) => {
        return (
          <circle
            key={index}
            cx={bend[0]}
            cy={bend[1]}
            r={handleSize}
            className="dark:fill-blacck cursor-move fill-white stroke-black dark:stroke-white"
          ></circle>
        );
      })}
    </>
  );
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
  data,
  label,
  selected,
}: EdgeProps<DrivenConnectionEdge> & {
  deleteClassName: string;
  onDelete?: (id: string) => void;
  handleSize?: number;
}) {
  const endpoints: EndPoints = {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  };
  const { edgePath, labelX, labelY } = useBendyPath(
    endpoints,
    data?.bends as Bends | undefined,
    handleSize,
  );
  const isInteractive = useIsInteractive();

  const deleteConnection = useCallback(() => {
    if (window.confirm("Are you sure you want to delete this connection?")) {
      onDelete(id);
    }
  }, [id, onDelete]);

  const reactFlow = useReactFlow();
  const updateBends = useCallback(
    (bends: Bends) => {
      reactFlow.updateEdgeData(id, {
        bends,
      });
    },
    [id, reactFlow],
  );

  const myStyle = selected ? { ...style, strokeWidth: 3 } : style;
  return (
    <>
      <BaseEdge id={id} path={edgePath} style={myStyle} markerEnd={markerEnd} />
      {selected && isInteractive && (
        <EditHandles
          endpoints={endpoints}
          bends={data?.bends as Bends | undefined}
          updateBends={updateBends}
        />
      )}
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan absolute z-10 origin-center"
          style={{
            pointerEvents: "all",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          {label && <span className={deleteClassName}>{label}</span>}
          {isInteractive && !selected && (
            <button
              className={cn(
                "cursor-pointer rounded-full bg-background hover:bg-accent",
                deleteClassName,
              )}
              onClick={deleteConnection}
            >
              <XIcon size={12} />
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
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

function deleteConflictByGroup(group: string) {
  const all = store.getState().conflicts;
  const newConflicts = all.filter((c) => c.group !== group);
  store.getState().setConflicts(newConflicts);
}

export function ConflictingEdge(props: EdgeProps<ConflictingEdge>) {
  const group = props.data!.group!.toString();
  const onDelete = useCallback(() => {
    deleteConflictByGroup(group);
  }, [group]);
  return (
    <BaseEdgeWithDelete
      {...props}
      style={conflictingStyle}
      deleteClassName="text-amber-500"
      handleSize={CONFLICT_HANDLE_SIZE}
      onDelete={onDelete}
      label={group}
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
