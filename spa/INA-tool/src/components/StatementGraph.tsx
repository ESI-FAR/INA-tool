import { store } from "@/store";
import { useCallback, useEffect } from "react";
import { createStore, useStore } from "zustand";
import {
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Edge,
  Node,
  Controls,
  MiniMap,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  Position,
  NodeProps,
  Handle,
  useConnection,
  ConnectionLineComponentProps,
  NodeResizeControl,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Statements } from "@/lib/schema";
// TODO layout button
import ELK from "elkjs/lib/elk.bundled";
import { Button } from "./ui/button";
import { Maximize2Icon } from "lucide-react";

const elk = new ELK();

const useLayoutedElements = () => {
  const { getNodes, setNodes, getEdges, fitView } = useReactFlow();
  const defaultOptions = {
    "elk.algorithm": "layered",
    "elk.layered.spacing.nodeNodeBetweenLayers": 100,
    "elk.spacing.nodeNode": 20,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getLayoutedElements = useCallback((options: any) => {
    const layoutOptions = { ...defaultOptions, ...options };
    const graph = {
      id: "root",
      layoutOptions: layoutOptions,
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
  }, []);

  return { getLayoutedElements };
};

type FlowState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
};

const strokeStyleColor = {
  green: "#22c55e",
  purple: "#a855f7",
  red: "#ef4444",
} as const;

const flowStore = createStore<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    let edge: Edge | Connection = connection;
    if (connection.targetHandle === "color") {
      const nedge: Edge = {
        id: `${connection.source}-${connection.target}`,
        target: connection.target,
        source: connection.source,
        style: {
          stroke:
            strokeStyleColor[
              connection.sourceHandle as unknown as keyof typeof strokeColor
            ],
          strokeWidth: 2,
        },
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
      };
      edge = { ...nedge };
    }
    set({
      edges: addEdge(edge, get().edges),
    });
  },
  setNodes: (nodes) => {
    set({ nodes });
  },
  setEdges: (edges) => {
    set({ edges });
  },
}));

const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
};

function statementsToNodesEdges(statements: Statements): [Node[], Edge[]] {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let statementOffset = 0;
  for (const statement of statements) {
    const statementId = statement.Id ?? "invalid";
    const parentNode = {
      id: statementId,
      type: "statement",
      data: { label: statementId },
      position: { x: 0, y: statementOffset },
      style: {
        width: 1200,
        height: 120,
      },
    };
    nodes.push(parentNode);

    // TODO shapes is a pro feature,
    // TODO statement/group/parent resizing based on children is a pro feature

    const attributeId = `${statementId}-attribute`;
    const attributeNode: Node = {
      id: attributeId,
      type: "attribute",
      data: { label: statement.Attribute },
      position: { x: 120 * 2.3, y: statementOffset + 30 },
      parentId: statementId,
      extent: "parent",
      ...nodeDefaults,
    };
    nodes.push(attributeNode);

    if (statement["Activation Condition"]) {
      const activationConditionId = `${statementId}-activation-condition`;
      const activationConditionNode: Node = {
        id: activationConditionId,
        type: "activationCondition",
        data: { label: statement["Activation Condition"] },
        position: { x: 10, y: statementOffset + 30 },
        parentId: statementId,
        extent: "parent",
        ...nodeDefaults,
      };
      nodes.push(activationConditionNode);
      edges.push({
        id: `${statementId}-activation-condition-2-attribute`,
        source: activationConditionId,
        target: attributeId,
      });
    }

    const aimId = `${statementId}-aim`;
    const aimNode: Node = {
      id: aimId,
      type: "other",
      data: { label: statement.Aim, flavor: "A" },
      position: { x: 240 * 2, y: statementOffset + 30 },
      parentId: statementId,
      extent: "parent",
      ...nodeDefaults,
    };
    nodes.push(aimNode);
    edges.push({
      id: `${statementId}-attribute-2-aim`,
      source: attributeId,
      target: aimId,
    });

    if (statement["Direct Object"]) {
      const directObjectId = `${statementId}-direct-object`;
      const directObjectNode: Node = {
        id: directObjectId,
        type: "other",
        data: { label: statement["Direct Object"], flavor: "DO" },
        position: { x: 420 * 1.7, y: statementOffset + 30 },
        parentId: statementId,
        extent: "parent",
        ...nodeDefaults,
      };
      nodes.push(directObjectNode);
      edges.push({
        id: `${statementId}-aim-2-direct-object`,
        source: aimId,
        target: directObjectId,
      });

      if (statement["Indirect Object"]) {
        const indirectObjectId = `${statementId}-indirect-object`;
        const indirectObjectNode: Node = {
          id: indirectObjectId,
          data: { label: statement["Indirect Object"], flavor: "IO" },
          type: "other",
          position: { x: 420 * 2.3, y: statementOffset + 30 },
          parentId: statementId,
          extent: "parent",
          ...nodeDefaults,
        };
        nodes.push(indirectObjectNode);
        edges.push({
          id: `${statementId}-direct-object-2-indirect-object`,
          source: directObjectId,
          target: indirectObjectId,
        });
      }

      if (statement["Execution Constraint"]) {
        const executionConstraintId = `${statementId}-execution-constraint`;
        const executionConstraintNode: Node = {
          id: executionConstraintId,
          type: "other",
          data: { label: statement["Execution Constraint"], flavor: "EC" },
          position: { x: 240 * 1.95, y: statementOffset + 50 },
          parentId: statementId,
          extent: "parent",
          ...nodeDefaults,
        };
        nodes.push(executionConstraintNode);
        // aim 2 execution constraint edge
        edges.push({
          id: `${statementId}-aim-2-execution-constraint`,
          source: aimId,
          target: executionConstraintId,
        });
      }
    }

    statementOffset += 130;
  }
  return [nodes, edges];
}

type StatementNode = Node<{ label: string }, "statement">;

function StatementNode({ data }: NodeProps<StatementNode>) {
  return (
    <fieldset className="h-full w-full rounded-md border border-gray-300 bg-transparent p-4 shadow-md">
      <NodeResizeControl minWidth={100} minHeight={50}>
        <Maximize2Icon className="h-2 w-2 rotate-90" />
      </NodeResizeControl>
      <legend>{data.label}</legend>
    </fieldset>
  );
}

type AttributeNode = Node<{ label: string }, "attribute">;

const DEFAULT_HANDLE_STYLE = {
  width: 10,
  height: 10,
  bottom: -5,
};

function Handles({ isConnectable }: { isConnectable: boolean }) {
  return (
    <>
      <Handle
        type="source"
        id="statement"
        position={Position.Right}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        id="statement"
        position={Position.Left}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        id="color"
        className="bg-gradient-to-r from-green-500 to-red-500"
        style={{ ...DEFAULT_HANDLE_STYLE }}
        position={Position.Top}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        id="green"
        position={Position.Bottom}
        className="!bg-green-500"
        style={{ ...DEFAULT_HANDLE_STYLE, left: "15%" }}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="purple"
        className="!bg-purple-500"
        style={{ ...DEFAULT_HANDLE_STYLE, left: "50%" }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="red"
        className="!bg-red-500"
        style={{ ...DEFAULT_HANDLE_STYLE, left: "85%" }}
        isConnectable={isConnectable}
      />
    </>
  );
}

type ActivationConditionNode = Node<{ label: string }, "activationCondition">;

// TODO make look more like a hexagon
function ActivationConditionNode({
  data,
  isConnectable,
}: NodeProps<ActivationConditionNode>) {
  return (
    <div className="border-1 rounded-xl border border-black p-2">
      <div className="text-sm text-gray-200">Attribute</div>
      <div className="h-fit w-fit">{data.label}</div>
      <Handles isConnectable={isConnectable} />
    </div>
  );
}

function AttributeNode({ data, isConnectable }: NodeProps<AttributeNode>) {
  return (
    <div className="border-1 rounded-full border border-black p-2">
      <div className="h-fit w-fit">{data.label}</div>
      <Handles isConnectable={isConnectable} />
    </div>
  );
}

type OtherNode = Node<{ label: string; flavor: string }, "other">;

function OtherNode({ data, isConnectable }: NodeProps<OtherNode>) {
  return (
    <div className="border-1 border border-black p-2">
      <div className="text-sm text-gray-200">{data.flavor}</div>
      <div className="h-fit w-fit">{data.label}</div>
      <Handles isConnectable={isConnectable} />
    </div>
  );
}

const nodeTypes = {
  statement: StatementNode,
  activationCondition: ActivationConditionNode,
  attribute: AttributeNode,
  other: OtherNode,
};

const strokeColor = {
  green: "stroke-green-500",
  purple: "stroke-purple-500",
  red: "stroke-red-500",
} as const;

function ConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
}: ConnectionLineComponentProps) {
  const { fromHandle } = useConnection();
  const color = fromHandle?.id;
  const stroke = color ? strokeColor[color as keyof typeof strokeColor] : "";

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
  const statements = useStore(store, (state) => state.statements);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setEdges,
    setNodes,
  } = useStore(flowStore);
  useEffect(() => {
    const [initialNodes, initialEdges] = statementsToNodesEdges(statements);
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [setEdges, setNodes, statements]);
  const { getLayoutedElements } = useLayoutedElements();

  return (
    <div>
      <h1>GraphCanvas</h1>
      <div className="h-[800px] w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          connectionLineComponent={ConnectionLine}
        >
          <Panel position="top-right">
            <Button
              variant="ghost"
              onClick={() =>
                getLayoutedElements({
                  "elk.algorithm": "layered",
                  "elk.direction": "RIGHT",
                })
              }
            >
              Layout
            </Button>
            {/* TODO replace record button with download button */}
            <Button
              variant="ghost"
              onClick={() => {
                console.log({ nodes, edges });
              }}
            >
              Record
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
