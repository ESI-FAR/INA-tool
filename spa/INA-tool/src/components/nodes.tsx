import { Statement } from "@/lib/schema";
import { store } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Handle,
  NodeProps,
  NodeResizeControl,
  NodeToolbar,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { Maximize2Icon } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useStore } from "zustand";
import { StatementCard } from "./StatementCard";
import type {
  StatementNode,
  AttributeNode,
  AimNode,
  DirectObjectNode,
  InDirectObjectNode,
  ActivationConditionNode,
  ExecutionConstraintNode,
} from "@/lib/node";

/*
The statement graph should look like:

  ActivationConditionNode? -> AttributeNode -Deonic-> Aim -> DirectObjectNode?
                                                       |                    |                
                                                       v                    v
                                            ExecutionConstraintNode?   InDirectObjectNode?
*/

function SourceHandles({
  isConnectable,
  statement,
}: {
  isConnectable: boolean;
  statement: Statement;
}) {
  const style = useMemo(
    () => ({
      width: isConnectable ? 10 : 4,
      height: isConnectable ? 10 : 4,
    }),
    [isConnectable],
  );
  const allowActorDriven =
    (statement["Direct Object"] &&
      statement["Type of Direct Object"] === "animate") ||
    (statement["Indirect Object"] &&
      statement["Type of Indirect Object"] === "animate") ||
    statement["Execution Constraint"];
  const allowOutcomeDriven =
    (statement["Direct Object"] &&
      statement["Type of Direct Object"] === "inanimate") ||
    (statement["Indirect Object"] &&
      statement["Type of Indirect Object"] === "inanimate");
  return (
    <>
      {allowActorDriven && (
        <Handle
          type="source"
          id="actor-driven"
          className="!bg-purple-500"
          style={{ ...style, left: "25%" }}
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      )}
      {allowOutcomeDriven && (
        <Handle
          type="source"
          id="outcome-driven"
          className="!bg-green-500"
          style={{ ...style, left: "50%" }}
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      )}
      <Handle
        type="source"
        id="sanction-driven"
        className="!bg-red-500"
        style={{ ...style, left: "75%" }}
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </>
  );
}

function TargetHandles({
  isConnectable,
  statement,
}: {
  isConnectable: boolean;
  statement: Statement;
}) {
  const style = useMemo(
    () => ({
      width: isConnectable ? 10 : 4,
      height: isConnectable ? 10 : 4,
    }),
    [isConnectable],
  );
  return (
    <>
      <Handle
        type="target"
        id="actor-driven"
        className="!bg-purple-500"
        style={{ ...style, left: "25%" }}
        position={Position.Top}
        isConnectable={isConnectable}
      />
      {statement["Activation Condition"] && (
        <>
          <Handle
            type="target"
            id="outcome-driven"
            className="!bg-green-500"
            style={{ ...style, left: "50%" }}
            position={Position.Top}
            isConnectable={isConnectable}
          />
          <Handle
            type="target"
            id="sanction-driven"
            className="!bg-red-500"
            style={{ ...style, left: "75%" }}
            position={Position.Top}
            isConnectable={isConnectable}
          />
        </>
      )}
    </>
  );
}

function CompactStatementNode({
  statement,
  isConnectable,
  selected,
}: {
  statement: Statement;
  isConnectable: boolean;
  selected: boolean | undefined;
}) {
  const { updateNode } = useReactFlow();
  const onToolbarClick = useCallback(() => {
    updateNode(statement.Id!, {
      selected: false,
    });
  }, [statement.Id, updateNode]);
  return (
    <>
      {" "}
      {/* TODO show statement card in drawer. nice if on hover drawer could be filled? */}
      <NodeToolbar
        nodeId={statement.Id}
        position={Position.Right}
        onClick={onToolbarClick}
      >
        <StatementCard statement={statement} />
      </NodeToolbar>
      <SourceHandles isConnectable={isConnectable} statement={statement} />
      <TargetHandles isConnectable={isConnectable} statement={statement} />
      <div
        className={cn("min-w-12 cursor-pointer rounded border-2 p-1", {
          "border-slate-400": !selected,
          "border-slate-900": selected,
        })}
      >
        {statement["Statement Type"] === "formal" ? "F" : "I"}
        {statement.Id}
      </div>
    </>
  );
}

export const statementBackground = {
  formal: "bg-sky-100 dark:bg-sky-600",
  informal: "bg-yellow-100 dark:bg-yellow-600"
} as const;

export function StatementNode({
  data,
  isConnectable,
  selected,
}: NodeProps<StatementNode>) {
  const isCompact = useStore(store, (s) => s.isCompact);
  if (isCompact) {
    return (
      <CompactStatementNode
        statement={data.raw}
        isConnectable={isConnectable}
        selected={selected}
      />
    );
  }
  const color = statementBackground[data.raw["Statement Type"]];
  return (
    <fieldset
      className={cn(
        "h-full w-full rounded-md border border-gray-300 p-4 shadow-md",
        color,
      )}
    >
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
