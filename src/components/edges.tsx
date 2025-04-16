import {
  EndPoints,
  useIsInteractive,
  usePathEndpoints,
} from "@/hooks/use-interactive";
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
  useNodes,
} from "@xyflow/react";
import { textColor } from "./drivenColors";
import { cn } from "@/lib/utils";
import { store } from "@/stores/global";
import { connection2id } from "@/lib/connection2id";
import { useCallback, useEffect } from "react";
import { conflict2id } from "@/stores/component-network";
import { XIcon } from "lucide-react";
import { AvoidLib } from "libavoid-js";
import { INANode, isComponentNode, isStatementNode } from "@/lib/node";

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

// eslint-disable-next-line react-refresh/only-export-components
export function useLibAvoid() {
  // make sure that AvoidLib is loaded and ready to use
  useEffect(() => {
    const libavoidWasm = "./libavoid.wasm";
    AvoidLib.load(libavoidWasm).catch((e) => {
      console.error("Failed to load libavoid wasm", e);
    });
  }, []);
}

function computeAvoidedPath(
  endpoints: EndPoints,
  nodes: INANode[],
  id: string,
): [string, number, number] {
  try {
    // TODO make lazy, do not reconstruct avoid router every time
    const Avoid = AvoidLib.getInstance();
    const router = new Avoid.Router(Avoid.OrthogonalRouting);
    const pad = 2;
    for (const node of nodes) {
      if (isComponentNode(node)) {
        // Exclude component nodes
        // continue;
      }
      if (isStatementNode(node) && id.includes(node.id)) {
        // Exclude statement nodes which are part of the edge
        // continue;
      }
      if (!node.measured) {
        continue;
      }
      new Avoid.ShapeRef(
        router,
        new Avoid.Rectangle(
          new Avoid.Point(node.position.x - pad, node.position.y - pad),
          new Avoid.Point(
            node.position.x + node.measured.width! + pad,
            node.position.y + node.measured.height! + pad,
          ),
        ),
      );
    }
    const connRef = new Avoid.ConnRef(
      router,
      new Avoid.ConnEnd(new Avoid.Point(endpoints.sourceX, endpoints.sourceY)),
      new Avoid.ConnEnd(new Avoid.Point(endpoints.targetX, endpoints.targetY)),
    );

    router.processTransaction();
    const route = connRef.displayRoute();
    const nrPoints = route.size();
    const points = [];
    for (let i = 0; i < nrPoints; i++) {
      const point = route.get_ps(i);
      points.push([point.x, point.y]);
    }

    let pathData = `M${points[0][0]},${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      pathData += ` L${points[i][0]},${points[i][1]}`;
    }

    let centerX = (points[0][0] + points[points.length - 1][0]) / 2;
    let centerY = (points[0][1] + points[points.length - 1][1]) / 2;
    const middleIndex = Math.floor(points.length / 2);
    if (points.length % 2 === 0) {
      // If even then odd line segments -> use middle of middle line
      centerX = (points[middleIndex - 1][0] + points[middleIndex][0]) / 2;
      centerY = (points[middleIndex - 1][1] + points[middleIndex][1]) / 2;
    } else {
      // If odd then even line segments -> use middle corner
      centerX = points[middleIndex][0];
      centerY = points[middleIndex][1];
    }

    Avoid.destroy(router);
    return [pathData, centerX, centerY];
  } catch {
    // Could be that the libavoid is not loaded yet
    console.log("avoid failed, fallback to smooth step path");
    const [path, centerX, centerY] = getSmoothStepPath(endpoints);
    return [path, centerX, centerY];
  }
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

  const nodes = useNodes<INANode>();
  const [edgePath, labelX, labelY] = computeAvoidedPath(endpoints, nodes, id);

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
