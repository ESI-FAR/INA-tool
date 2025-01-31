import { Statement } from "@/lib/schema";
import { store } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Handle,
  Node,
  NodeProps,
  NodeResizeControl,
  NodeToolbar,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { Maximize2Icon } from "lucide-react";
import { CSSProperties, useCallback, useMemo } from "react";
import { Fragment } from "react/jsx-runtime";
import { useStore } from "zustand";

export type StatementNode = Node<
  { raw: Statement; label: string; formalism?: string },
  "statement"
> & { uncompactStyle?: CSSProperties };
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

function StatementCard({ statement }: { statement: Statement }) {
  return (
    <div className="bg-card p-2 text-card-foreground shadow">
      <dl className="grid grid-cols-[auto_1fr] gap-x-2 text-sm">
        <dt className="font-semibold">Statement Type:</dt>
        <dd>{statement["Statement Type"]}</dd>
        <dt className="font-semibold">Attribute:</dt>
        <dd>{statement.Attribute}</dd>
        {statement.Deontic && (
          <Fragment key="Deontic">
            <dt className="font-semibold">Deontic:</dt>
            <dd>{statement.Deontic}</dd>
          </Fragment>
        )}
        <dt className="font-semibold">Aim:</dt>
        <dd>{statement.Aim}</dd>
        {statement["Direct Object"] && (
          <Fragment key="Direct Object">
            <dt className="font-semibold">Direct Object:</dt>
            <dd>{statement["Direct Object"]}</dd>
          </Fragment>
        )}
        {statement["Type of Direct Object"] && (
          <Fragment key="Type of Direct Object">
            <dt className="font-semibold">Type of Direct Object:</dt>
            <dd>{statement["Type of Direct Object"]}</dd>
          </Fragment>
        )}
        {statement["Indirect Object"] && (
          <Fragment key="Indirect Object">
            <dt className="font-semibold">Indirect Object:</dt>
            <dd>{statement["Indirect Object"]}</dd>
          </Fragment>
        )}
        {statement["Type of Indirect Object"] && (
          <Fragment key="Type of Indirect Object">
            <dt className="font-semibold">Type of Indirect Object:</dt>
            <dd>{statement["Type of Indirect Object"]}</dd>
          </Fragment>
        )}
        {statement["Activation Condition"] && (
          <Fragment key="Activation Condition">
            <dt className="font-semibold">Activation Condition:</dt>
            <dd>{statement["Activation Condition"]}</dd>
          </Fragment>
        )}
        {statement["Execution Constraint"] && (
          <Fragment key="Execution Constraint">
            <dt className="font-semibold">Execution Constraint:</dt>
            <dd>{statement["Execution Constraint"]}</dd>
          </Fragment>
        )}
        {statement["Or Else"] && (
          <Fragment key="Or Else">
            <dt className="font-semibold">Or Else:</dt>
            <dd>{statement["Or Else"]}</dd>
          </Fragment>
        )}
      </dl>
    </div>
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
