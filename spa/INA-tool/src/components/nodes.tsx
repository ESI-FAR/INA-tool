import { Statement } from "@/lib/schema";
import {
  Handle,
  Node,
  NodeProps,
  NodeResizeControl,
  Position,
} from "@xyflow/react";
import { Maximize2Icon } from "lucide-react";

export type StatementNode = Node<
  { raw: Statement; label: string; formalism?: string },
  "statement"
>;
export type AttributeNode = Node<{ label: string }, "attribute">;
export type AimNode = Node<{ label: string }, "aim">;
export type DirectObjectNode = Node<
  { animation?: string; label: string },
  "direct-object"
>;
export type InDirectObjectNode = Node<
  { animation?: string; label: string },
  "indirect-object"
>;
export type ActivationConditionNode = Node<
  { label: string },
  "activation-condition"
>;
export type ExecutionConstraintNode = Node<
  { label: string },
  "execution-constraint"
>;

export type InnerStatementNode =
  | AttributeNode
  | AimNode
  | DirectObjectNode
  | InDirectObjectNode
  | ActivationConditionNode
  | ExecutionConstraintNode;

export type INANode = StatementNode | InnerStatementNode;

/*
The statement graph should look like:

  ActivationConditionNode? -> AttributeNode -Deonic-> Aim -> DirectObjectNode?
                                                       |                    |                
                                                       v                    v
                                            ExecutionConstraintNode?   InDirectObjectNode?
*/

export function StatementNode({ data }: NodeProps<StatementNode>) {
  return (
    <fieldset className="h-full w-full rounded-md border border-gray-300 bg-transparent p-4 shadow-md">
      <NodeResizeControl minWidth={100} minHeight={50}>
        <Maximize2Icon className="absolute bottom-2 right-2 h-2 w-2 rotate-90" />
      </NodeResizeControl>
      <legend>
        {data.formalism === "formal" ? "F" : "I"}
        {data.label}
      </legend>
    </fieldset>
  );
}

export function AttributeNode({
  data,
  isConnectable,
}: NodeProps<AttributeNode>) {
  return (
    <div className="border-1 max-w-48 rounded-full border border-foreground p-2">
      <div className="h-fit w-fit">{data.label}</div>
      <Handle
        type="target"
        id="statement"
        position={Position.Left}
        isConnectable={false}
      />
      <Handle
        type="source"
        id="statement"
        position={Position.Right}
        isConnectable={false}
      />
      <Handle
        type="target"
        id="actor-driven"
        className="!bg-purple-500"
        style={drivenConnectionHandleStye}
        position={Position.Top}
        isConnectable={isConnectable}
      />
    </div>
  );
}

export function AimNode({ data, isConnectable }: NodeProps<AimNode>) {
  return (
    <div className="border-1 max-w-48 border border-foreground p-2">
      <div className="h-fit w-fit">{data.label}</div>
      <Handle
        type="target"
        id="statement"
        position={Position.Left}
        isConnectable={false}
      />
      <Handle
        type="source"
        id="direct-object"
        position={Position.Right}
        isConnectable={false}
      />
      <Handle
        type="source"
        id="execution-constraint"
        style={{ left: "33%" }}
        position={Position.Bottom}
        isConnectable={false}
      />
      <Handle
        type="source"
        id="sanction-driven"
        className="!bg-red-500"
        style={{ ...drivenConnectionHandleStye, left: "66%" }}
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  );
}

export function DirectObjectNode({
  data,
  isConnectable,
}: NodeProps<DirectObjectNode>) {
  return (
    <div className="border-1 max-w-48 rounded-sm border border-foreground p-2">
      <div className="h-fit w-fit">{data.label}</div>
      <Handle
        type="target"
        id="statement"
        position={Position.Left}
        isConnectable={false}
      />
      <Handle
        type="source"
        id="statement"
        style={{ left: "33%" }}
        position={Position.Bottom}
        isConnectable={false}
      />
      {data.animation === "animate" && (
        <Handle
          type="source"
          id="actor-driven"
          className="!bg-purple-500"
          style={{ ...drivenConnectionHandleStye, left: "66%" }}
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      )}
      {data.animation === "inanimate" && (
        <Handle
          type="source"
          id="outcome-driven"
          className="!bg-green-500"
          style={{ ...drivenConnectionHandleStye, left: "66%" }}
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      )}
    </div>
  );
}

export function InDirectObjectNode({
  data,
  isConnectable,
}: NodeProps<InDirectObjectNode>) {
  return (
    <div className="border-1 max-w-48 rounded-sm border border-foreground p-2">
      <div className="h-fit w-fit">{data.label}</div>
      <Handle
        type="target"
        id="statement"
        position={Position.Top}
        isConnectable={false}
      />
      {data.animation === "animate" && (
        <Handle
          type="source"
          id="actor-driven"
          className="!bg-purple-500"
          style={drivenConnectionHandleStye}
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      )}
      {data.animation === "inanimate" && (
        <Handle
          type="source"
          id="outcome-driven"
          className="!bg-green-500"
          style={drivenConnectionHandleStye}
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      )}
    </div>
  );
}

const drivenConnectionHandleStye = { width: 10, height: 10 } as const;

export function ActivationConditionNode({
  data,
  isConnectable,
}: NodeProps<ActivationConditionNode>) {
  return (
    <div className="border-1 max-w-48 rounded-xl border border-foreground p-2">
      <div className="h-fit w-fit">{data.label}</div>
      <Handle
        type="source"
        id="statement"
        position={Position.Right}
        isConnectable={false}
      />
      <Handle
        type="target"
        id="outcome-driven"
        className="!bg-green-500"
        style={{ ...drivenConnectionHandleStye, left: "33%" }}
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        id="sanction-driven"
        className="!bg-red-500"
        style={{ ...drivenConnectionHandleStye, left: "66%" }}
        position={Position.Top}
        isConnectable={isConnectable}
      />
    </div>
  );
}

export function ExecutionConstraintNode({
  data,
  isConnectable,
}: NodeProps<ExecutionConstraintNode>) {
  return (
    <div className="border-1 max-w-48 rounded-xl border border-foreground p-2">
      <div className="h-fit w-fit">{data.label}</div>
      <Handle
        type="target"
        id="statement"
        position={Position.Top}
        isConnectable={false}
      />
      <Handle
        type="source"
        id="actor-driven"
        className="!bg-purple-500"
        style={drivenConnectionHandleStye}
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const nodeTypes = {
  statement: StatementNode,
  attribute: AttributeNode,
  aim: AimNode,
  "direct-object": DirectObjectNode,
  "indirect-object": InDirectObjectNode,
  "activation-condition": ActivationConditionNode,
  "execution-constraint": ExecutionConstraintNode,
} as const;
