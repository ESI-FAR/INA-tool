import { Statement, StatementType } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { Handle, NodeProps, NodeResizeControl, Position } from "@xyflow/react";
import { Maximize2Icon } from "lucide-react";
import { useMemo } from "react";
import type {
  StatementNode,
  AttributeNode,
  AimNode,
  DirectObjectNode,
  InDirectObjectNode,
  ActivationConditionNode,
  ExecutionConstraintNode,
  ConflictGroupNode,
  INANode,
} from "@/lib/node";
import { bgColor } from "./drivenColors";

/*
The statement graph should look like:

  ActivationConditionNode? -> AttributeNode -Deonic-> Aim -> DirectObjectNode?
                                                       |                    |                
                                                       v                    v
                                            ExecutionConstraintNode?   InDirectObjectNode?


Or in mermaid format:

```mermaid
graph LR;
    ac{{Activation Condition}}-->att((Attribute))
    att-->|Deontic|aim(Aim)
    aim-->do([Direct Object])
    do-->io([Indirect Object])
    aim-->ec{{Execution Constraint}}
```
*/

// Keep in sync with colors in Hexagon.borderClassName
// hexagon uses background instead border
const selectedClassName = (v: boolean | undefined) =>
  v
    ? "border-slate-900 dark:border-slate-100"
    : "border-slate-400 dark:border-slate-400 hover:border-slate-900 dark:hover:border-slate-100";

const handleStyle = {
  width: 10,
  height: 10,
};

function SourceHandles({
  isConnectable,
  statement,
}: {
  isConnectable: boolean;
  statement: Statement;
}) {
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
          id="actor"
          className={cn(bgColor.actor, { invisible: !isConnectable })}
          style={{
            ...handleStyle,
            left: "25%",
          }}
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      )}
      {allowOutcomeDriven && (
        <Handle
          type="source"
          id="outcome"
          className={cn(bgColor.outcome, { invisible: !isConnectable })}
          style={{ ...handleStyle, left: "50%" }}
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      )}
      <Handle
        type="source"
        id="sanction"
        className={cn(bgColor.sanction, { invisible: !isConnectable })}
        style={{ ...handleStyle, left: "75%" }}
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
  return (
    <>
      <Handle
        type="target"
        id="actor"
        className={cn(bgColor.actor, { invisible: !isConnectable })}
        style={{ ...handleStyle, left: "25%" }}
        position={Position.Top}
        isConnectable={isConnectable}
      />
      {statement["Activation Condition"] && (
        <>
          <Handle
            type="target"
            id="outcome"
            className={cn(bgColor.outcome, { invisible: !isConnectable })}
            style={{ ...handleStyle, left: "50%" }}
            position={Position.Top}
            isConnectable={isConnectable}
          />
          <Handle
            type="target"
            id="sanction"
            className={cn(bgColor.sanction, { invisible: !isConnectable })}
            style={{ ...handleStyle, left: "75%" }}
            position={Position.Top}
            isConnectable={isConnectable}
          />
        </>
      )}
    </>
  );
}

function ConflictHandles({ type }: { type: StatementType }) {
  if (type === "formal") {
    return (
      <Handle
        type="source"
        id="conflict"
        className="invisible"
        position={Position.Right}
        isConnectable={false}
      />
    );
  }
  return (
    <Handle
      type="target"
      id="conflict"
      className="invisible"
      position={Position.Left}
      isConnectable={false}
    />
  );
}

export function CollapsedStatementNode({
  data,
  isConnectable,
  selected,
}: NodeProps<StatementNode>) {
  const statement = data.raw;
  const color = statementBackground[data.raw["Statement Type"]];
  return (
    <>
      <SourceHandles isConnectable={isConnectable} statement={statement} />
      <TargetHandles isConnectable={isConnectable} statement={statement} />
      <ConflictHandles type={statement["Statement Type"]} />
      <div
        className={cn(
          "min-w-12 cursor-pointer rounded border-2 p-1",
          color,
          selectedClassName(selected),
        )}
      >
        {data.label}
      </div>
    </>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const statementBackground = {
  formal: "bg-sky-100/30 dark:bg-sky-600/30",
  informal: "bg-yellow-100/30 dark:bg-yellow-600/30",
} as const;

export function StatementNode({
  data,
  selected,
  isConnectable,
}: NodeProps<StatementNode>) {
  const formalism = data.raw["Statement Type"];
  const color = statementBackground[formalism];
  return (
    <fieldset
      className={cn(
        "h-full w-full rounded-md border border-gray-300 p-4 shadow-md dark:border-gray-700",
        color,
        selectedClassName(selected),
      )}
    >
      {isConnectable && (
        <NodeResizeControl minWidth={100} minHeight={50}>
          <Maximize2Icon className="absolute bottom-2 right-2 h-2 w-2 rotate-90" />
        </NodeResizeControl>
      )}
      <ConflictHandles type={data.raw["Statement Type"]} />
      <legend>{data.label}</legend>
    </fieldset>
  );
}

export function AttributeNode({
  data,
  isConnectable,
  selected,
}: NodeProps<AttributeNode>) {
  return (
    <div
      className={cn(
        "border-1 max-w-48 rounded-full border border-foreground p-2",
        selectedClassName(selected),
      )}
    >
      <div className="h-fit w-fit">{data.label}</div>
      <Handle
        type="target"
        id="statement"
        className={isConnectable ? "" : "invisible"}
        position={Position.Left}
        isConnectable={false}
      />
      <Handle
        type="source"
        id="statement"
        className={isConnectable ? "" : "invisible"}
        position={Position.Right}
        isConnectable={false}
      />
      <Handle
        type="target"
        id="actor"
        className={cn(bgColor.actor, { invisible: !isConnectable })}
        style={drivenConnectionHandleStye}
        position={Position.Top}
        isConnectable={isConnectable}
      />
    </div>
  );
}

export function AimNode({ data, isConnectable, selected }: NodeProps<AimNode>) {
  return (
    <div
      className={cn(
        "border-1 max-w-48 border border-foreground p-2",
        selectedClassName(selected),
      )}
    >
      <div className="h-fit w-fit">{data.label}</div>
      <Handle
        type="target"
        id="statement"
        className={isConnectable ? "" : "invisible"}
        position={Position.Left}
        isConnectable={false}
      />
      <Handle
        type="source"
        id="direct-object"
        className={isConnectable ? "" : "invisible"}
        position={Position.Right}
        isConnectable={false}
      />
      <Handle
        type="source"
        id="execution-constraint"
        className={isConnectable ? "" : "invisible"}
        style={{ left: "33%" }}
        position={Position.Bottom}
        isConnectable={false}
      />
      <Handle
        type="source"
        id="sanction"
        className={cn(bgColor.sanction, { invisible: !isConnectable })}
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
  selected,
}: NodeProps<DirectObjectNode>) {
  return (
    <div
      className={cn(
        "border-1 max-w-48 rounded-sm border border-foreground p-2",
        selectedClassName(selected),
      )}
    >
      <div className="h-fit w-fit">{data.label}</div>
      <Handle
        type="target"
        id="statement"
        className={isConnectable ? "" : "invisible"}
        position={Position.Left}
        isConnectable={false}
      />
      <Handle
        type="source"
        id="statement"
        className={isConnectable ? "" : "invisible"}
        style={{ left: "33%" }}
        position={Position.Bottom}
        isConnectable={false}
      />
      {data.animation === "animate" && (
        <Handle
          type="source"
          id="actor"
          className={cn(bgColor.actor, { invisible: !isConnectable })}
          style={{ ...drivenConnectionHandleStye, left: "66%" }}
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      )}
      {data.animation === "inanimate" && (
        <Handle
          type="source"
          id="outcome"
          className={cn(bgColor.outcome, { invisible: !isConnectable })}
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
  selected,
}: NodeProps<InDirectObjectNode>) {
  return (
    <div
      className={cn(
        "border-1 max-w-48 rounded-sm border border-foreground p-2",
        selectedClassName(selected),
      )}
    >
      <div className="h-fit w-fit">{data.label}</div>
      <Handle
        type="target"
        id="statement"
        className={isConnectable ? "" : "invisible"}
        position={Position.Top}
        isConnectable={false}
      />
      {data.animation === "animate" && (
        <Handle
          type="source"
          id="actor"
          className={cn(bgColor.actor, { invisible: !isConnectable })}
          style={drivenConnectionHandleStye}
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      )}
      {data.animation === "inanimate" && (
        <Handle
          type="source"
          id="outcome"
          className={cn(bgColor.outcome, { invisible: !isConnectable })}
          style={drivenConnectionHandleStye}
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      )}
    </div>
  );
}

const drivenConnectionHandleStye = { width: 10, height: 10 } as const;

function Hexagon({
  children,
  selected,
}: {
  children: React.ReactNode;
  selected: boolean | undefined;
}) {
  // Extracted from https://html-polygon.com/play
  // TODO make rectangle inside hexagon wider

  // Keep in sync with colors in selectedClassName
  const borderClassName = useMemo(
    () =>
      selected
        ? "bg-slate-900 dark:bg-slate-100"
        : "bg-slate-400 dark:bg-slate-400 group-hover:bg-slate-900 dark:group-hover:bg-slate-100",
    [selected],
  );

  return (
    <div
      className="group"
      style={{
        clipPath:
          "polygon(75% 6.699%, 25% 6.699%, 0% 50%, 25% 93.301%, 75% 93.301%, 100% 50%)",
      }}
    >
      <div className="relative h-full w-full overflow-hidden">
        <div
          className={cn("absolute h-full w-full", borderClassName)}
          style={{
            clipPath:
              "polygon(74.423% 7.699%, 25.577% 7.699%, 1.155% 50%, 25.577% 92.301%, 74.423% 92.301%, 98.845% 50%, 74.423% 7.699%, 74.423% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 74.423% 0%)",
          }}
        />
        <div style={{ height: "12.699%" }} />
        <div
          className="float-left clear-left mx-0"
          style={{
            height: "37.301%",
            width: "28.464%",
            shapeOutside: "polygon(0% 0%, 100% 0%, 24.34% 100%, 0% 100%)",
          }}
        />
        <div
          className="float-right clear-right mx-0"
          style={{
            height: "37.301%",
            width: "28.464%",
            shapeOutside: "polygon(0% 0%, 100% 0%, 100% 100%, 75.66% 100%)",
          }}
        />
        <div
          className="float-left clear-left mx-0"
          style={{
            height: "37.301%",
            width: "28.464%",
            shapeOutside: "polygon(0% 0%, 24.34% 0%, 100% 100%, 0% 100%)",
          }}
        />
        <div
          className="float-right clear-right mx-0"
          style={{
            height: "37.301%",
            width: "28.464%",
            shapeOutside: "polygon(75.66% 0%, 100% 0%, 100% 100%, 0% 100%)",
          }}
        />
        <div
          className="float-left clear-left w-full"
          style={{
            height: "12.699%",
            shapeOutside: "polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%)",
          }}
        />
        {children}
      </div>
    </div>
  );
}

export function ActivationConditionNode({
  data,
  isConnectable,
  selected,
}: NodeProps<ActivationConditionNode>) {
  /**
   * <div id="html-polygon"
   * class="html-polygon html-polygon-sides-6" style="height: 425px;width:
   * 425px;background-color: rgb(204, 204, 204);color: rgb(0, 0, 0);text-align: justify;
   * clip-path: polygon(50% 0%, 6.699% 25%, 6.699% 75%, 50% 100%, 93.301% 75%, 93.301% 25%);">
   * <div id="html-polygon-border-container"
   * class="html-polygon-border-container" style="height: 100%; position: relative; width: 100%; overflow: hidden;">
   * <div id="html-polygon-border" class="html-polygon-border"
   * style="background-color: rgb(0, 0, 0); position: absolute; height: 100%; width: 100%;
   * clip-path: polygon(50% 1.155%, 7.699% 25.577%, 7.699% 74.423%, 50% 98.845%, 92.301% 74.423%, 92.301% 25.577%, 50% 1.155%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%);">
   * </div><div id="html-polygon-buffer-top" class="html-polygon-buffer html-polygon-buffer-top" style="height: 6.928%;"></div><div id="html-polygon-buffer-side-0" class="html-polygon-buffer html-polygon-buffer-side" style="clear: left; float: left; height: 21.536%; width: 50%; margin-left: 0px; margin-right: 0px; shape-outside: polygon(0% 0%, 100% 0%, 25.398% 100%, 0% 100%);"></div><div id="html-polygon-buffer-side-1" class="html-polygon-buffer html-polygon-buffer-side" style="clear: right; float: right; height: 21.536%; width: 50%; margin-left: 0px; margin-right: 0px; shape-outside: polygon(0% 0%, 100% 0%, 100% 100%, 74.602% 100%);"></div><div id="html-polygon-buffer-side-2" class="html-polygon-buffer html-polygon-buffer-side" style="clear: left; float: left; height: 43.072%; width: 12.699%; margin-left: 0px; margin-right: 0px; shape-outside: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);"></div><div id="html-polygon-buffer-side-3" class="html-polygon-buffer html-polygon-buffer-side" style="clear: right; float: right; height: 43.072%; width: 12.699%; margin-left: 0px; margin-right: 0px; shape-outside: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);"></div><div id="html-polygon-buffer-side-4" class="html-polygon-buffer html-polygon-buffer-side" style="clear: left; float: left; height: 21.536%; width: 50%; margin-left: 0px; margin-right: 0px; shape-outside: polygon(0% 0%, 25.398% 0%, 100% 100%, 0% 100%);"></div><div id="html-polygon-buffer-side-5" class="html-polygon-buffer html-polygon-buffer-side" style="clear: right; float: right; height: 21.536%; width: 50%; margin-left: 0px; margin-right: 0px; shape-outside: polygon(74.602% 0%, 100% 0%, 100% 100%, 0% 100%);"></div><div id="html-polygon-buffer-bottom" class="html-polygon-buffer html-polygon-buffer-bottom" style="height: 6.928%; width: 100%; clear: left; float: left; shape-outside: polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%);"></div>Consequat ad esse mollit nostrud mollit. Exercitation exercitation nostrud ut est aliqua laboris velit. Reprehenderit nostrud tempor elit adipisicing culpa officia. Sunt do aliqua minim consectetur consequat amet. In consequat.</div></div>
   */

  return (
    <>
      <Hexagon selected={selected}>
        <div className="max-w-48 px-12 py-1">{data.label}</div>
      </Hexagon>
      <Handle
        type="source"
        id="statement"
        className={isConnectable ? "" : "invisible"}
        position={Position.Right}
        isConnectable={false}
      />
      <Handle
        type="target"
        id="outcome"
        className={cn(bgColor.outcome, { invisible: !isConnectable })}
        style={{ ...drivenConnectionHandleStye, left: "33%", top: "6px" }}
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        id="sanction"
        className={cn(bgColor.sanction, { invisible: !isConnectable })}
        style={{ ...drivenConnectionHandleStye, left: "66%", top: "6px" }}
        position={Position.Top}
        isConnectable={isConnectable}
      />
    </>
  );
}

export function ExecutionConstraintNode({
  data,
  isConnectable,
  selected,
}: NodeProps<ExecutionConstraintNode>) {
  return (
    <div
      className={cn(
        "border-1 max-w-48 rounded-xl border border-foreground p-2",
        selectedClassName(selected),
      )}
    >
      <div className="h-fit w-fit">{data.label}</div>
      <Handle
        type="target"
        id="statement"
        className={isConnectable ? "" : "invisible"}
        position={Position.Top}
        isConnectable={false}
      />
      <Handle
        type="source"
        id="actor"
        className={cn(bgColor.actor, { invisible: !isConnectable })}
        style={drivenConnectionHandleStye}
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  );
}

export function ConflictGroupNode() {
  return (
    <div className="h-full w-full rounded border-2 bg-red-500 shadow"></div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const nodeTypes = {
  statement: StatementNode,
  Attribute: AttributeNode,
  Aim: AimNode,
  "Direct Object": DirectObjectNode,
  "Indirect Object": InDirectObjectNode,
  "Activation Condition": ActivationConditionNode,
  "Execution Constraint": ExecutionConstraintNode,
} as const;

// eslint-disable-next-line react-refresh/only-export-components
export function minimapNodeClassName(node: INANode) {
  if (node.type === "statement") {
    if (node.data.raw["Statement Type"] === "formal") {
      return "!fill-sky-50 dark:!fill-sky-700";
    } else {
      return "!fill-yellow-50 dark:!fill-yellow-700";
    }
  }
  return "";
}
