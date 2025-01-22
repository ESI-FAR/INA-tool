import { INAEdge, store } from "@/lib/store";
import { useCallback, useMemo } from "react";
import { useStore } from "zustand";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  useConnection,
  ConnectionLineComponentProps,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
// TODO layout button
import ELK from "elkjs/lib/elk.bundled";
import { Button } from "./ui/button";
import { nodeTypes } from "./nodes";
import { LayoutTemplateIcon } from "lucide-react";

const elk = new ELK();

const layoutOptions = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": 100,
  "elk.spacing.nodeNode": 20,
  "elk.direction": "RIGHT",
} as const;

const useLayoutedElements = () => {
  const { getNodes, setNodes, getEdges, fitView } = useReactFlow();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getLayoutedElements = useCallback(() => {
    const graph = {
      id: "root",
      layoutOptions,
      children: getNodes().map((node) => ({
        ...node,
        width: node.measured!.width,
        height: node.measured!.height,
      })),
      edges: getEdges(),
    };

    // @ts-expect-error copied from react-flow examples
    elk.layout(graph).then(({ children }) => {
      // By mutating the children in-place we saves ourselves from creating a
      // needless copy of the nodes array.
      children!.forEach((node) => {
        // @ts-expect-error copied from react-flow examples
        node.position = { x: node.x, y: node.y };
      });

      // @ts-expect-error copied from react-flow examples
      setNodes(children);
      window.requestAnimationFrame(() => {
        fitView();
      });
    });
  }, [fitView, getEdges, getNodes, setNodes]);

  return getLayoutedElements;
};

const strokeStyleColor = {
  "outcome-driven": "#22c55e",
  "actor-driven": "#a855f7",
  "sanction-driven": "#ef4444",
};

const strokeColor = {
  color: "stroke-black",
  "outcome-driven": "stroke-green-500",
  "actor-driven": "stroke-purple-500",
  "sanction-driven": "stroke-red-500",
} as const;

function createEdgeFromConnection(
  connection: Connection | INAEdge,
): Connection {
  const drive = connection.targetHandle!;
  const stroke = strokeStyleColor[drive as keyof typeof strokeStyleColor];
  if (stroke) {
    const nedge: INAEdge = {
      id: `${connection.source}-${connection.target}`,
      target: connection.target,
      source: connection.source,
      style: {
        stroke,
        strokeWidth: 2,
      },
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
    };
    return nedge as Connection;
  }
  // TODO dont cast
  return connection as Connection;
}

function ConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
}: ConnectionLineComponentProps) {
  const { fromHandle, toHandle } = useConnection();
  const stroke = useMemo(() => {
    const color = fromHandle?.id || toHandle?.id;
    // TODO sometime wrong color, when while dragging hovering over other driven handle
    const stroke = color
      ? strokeColor[color as keyof typeof strokeColor]
      : "stroke-black";
    return stroke;
  }, [fromHandle?.id, toHandle?.id]);

  return (
    <g>
      <path
        fill="none"
        className={"animated stroke-2 " + stroke}
        d={`M${fromX},${fromY} C ${fromX} ${toY} ${fromX} ${toY} ${toX},${toY}`}
      />
      <circle
        cx={toX}
        cy={toY}
        fill="#fff"
        r={3}
        className={stroke}
        strokeWidth={1.5}
      />
    </g>
  );
}

function LayoutFlow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useStore(store);
  const getLayoutedElements = useLayoutedElements();

  return (
    <div>
      <h1>GraphCanvas</h1>
      <div className="h-[800px] w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={(c: Connection | INAEdge) =>
            onConnect(createEdgeFromConnection(c))
          }
          nodeTypes={nodeTypes}
          connectionLineComponent={ConnectionLine}
        >
          <Panel position="top-right">
            <Button variant="ghost" onClick={getLayoutedElements}>
              <LayoutTemplateIcon />
              Layout
            </Button>
          </Panel>
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}

export function StatementGraph() {
  return (
    <ReactFlowProvider>
      <LayoutFlow />
    </ReactFlowProvider>
  );
}
