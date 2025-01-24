import { store } from "@/lib/store";
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
import ELK from "elkjs/lib/elk.bundled";
import { Button } from "./ui/button";
import { nodeTypes } from "./nodes";
import { LayoutTemplateIcon } from "lucide-react";
import { edgeTypes, INAEdge } from "./edges";
import { useTheme } from "./theme-provider";
import { ScreenshotButton } from "./ScreenshotButton";

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

const strokeColor = {
  color: "stroke-foreground",
  "outcome-driven": "stroke-green-500",
  "actor-driven": "stroke-purple-500",
  "sanction-driven": "stroke-red-500",
} as const;

function createEdgeFromConnection(
  connection: Connection | INAEdge,
): Connection {
  const type = connection.targetHandle as keyof typeof edgeTypes;
  if (type) {
    const nedge: INAEdge = {
      id: `${connection.source}-${connection.target}`,
      target: connection.target,
      source: connection.source,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type,
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
      : "stroke-foreground";
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
  const { theme } = useTheme();

  if (nodes.length === 0) {
    return (
      <div className="flex h-[800px] w-full items-center justify-center">
        <h1 className="text-3xl text-gray-500">
          No statements or connections, please upload a file.
        </h1>
      </div>
    );
  }

  return (
    <div className="h-full">
      <h1>Canvas</h1>
      <div className="h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={(c: Connection | INAEdge) =>
            onConnect(createEdgeFromConnection(c))
          }
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionLineComponent={ConnectionLine}
          isValidConnection={(connection) =>
            connection.sourceHandle === connection.targetHandle
          }
          fitView
          colorMode={theme}
        >
          <Panel position="top-right">
            <Button variant="ghost" onClick={getLayoutedElements}>
              <LayoutTemplateIcon />
              Layout
            </Button>
            <ScreenshotButton />
          </Panel>
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <LayoutFlow />
    </ReactFlowProvider>
  );
}
