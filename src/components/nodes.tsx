import { Statement } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { Handle, NodeProps, NodeResizeControl, Position } from "@xyflow/react";
import { Maximize2Icon } from "lucide-react";
import type {
  StatementNode,
  AttributeNode,
  AimNode,
  DirectObjectNode,
  InDirectObjectNode,
  ActivationConditionNode,
  ExecutionConstraintNode,
  INANode,
} from "@/lib/node";
import { bgColor } from "./drivenColors";
import { hexagonPolygonPoints } from "@/lib/shapes";
import { wrapText, lines2Box } from "@/lib/textwrap";
import { useMemo } from "react";

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
      statement["Type of Indirect Object"] === "inanimate") ||
    statement["Execution Constraint"];

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

function ConflictHandles() {
  return (
    <>
      <Handle
        type="source"
        id="conflict"
        className="invisible"
        position={Position.Right}
        isConnectable={false}
      />
      <Handle
        type="target"
        id="conflict"
        className="invisible"
        position={Position.Left}
        isConnectable={false}
      />
    </>
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
      <ConflictHandles />
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
      <ConflictHandles />
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
        "border-1 max-w-48 rounded-md border border-foreground p-2",
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
        "border-1 max-w-48 rounded-md border border-foreground p-2",
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
  text,
  selected,
}: {
  text: string;
  selected: boolean | undefined;
}) {
  const sideWidth = 20;
  const { lines, height, positions, points, width } = useMemo(() => {
    const { widthInChars, lines } = wrapText(text);
    const {
      width: textboxWidth,
      height,
      positions,
    } = lines2Box(lines, { widthInChars: widthInChars });
    const points = hexagonPolygonPoints(height, textboxWidth, sideWidth);
    const width = textboxWidth + sideWidth * 2;
    return { lines, height, positions, points, width, sideWidth };
  }, [text]);

  const borderClassName = selected
    ? "stroke-slate-900 dark:stroke-slate-100"
    : "stroke-slate-400 dark:stroke-slate-400 group-hover:stroke-slate-900 dark:group-hover:stroke-slate-100";

  return (
    <svg width={width} height={height} className="group">
      <polygon
        points={points}
        strokeWidth="1"
        fill="transparent"
        className={borderClassName}
      />
      {lines.map((line, i) => (
        <text
          x={sideWidth + positions[i].x}
          y={positions[i].y}
          key={line}
          className="fill-primary"
        >
          {line}
        </text>
      ))}
    </svg>
  );
}

export function ActivationConditionNode({
  data,
  isConnectable,
  selected,
}: NodeProps<ActivationConditionNode>) {
  return (
    <>
      <Hexagon selected={selected} text={data.label}></Hexagon>
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
        style={{ ...drivenConnectionHandleStye, left: "33%" }}
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        id="sanction"
        className={cn(bgColor.sanction, { invisible: !isConnectable })}
        style={{ ...drivenConnectionHandleStye, left: "66%" }}
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
    <>
      <Hexagon selected={selected} text={data.label}></Hexagon>
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
        style={{ ...drivenConnectionHandleStye, left: "33%" }}
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        id="outcome"
        className={cn(bgColor.outcome, { invisible: !isConnectable })}
        style={{ ...drivenConnectionHandleStye, left: "66%" }}
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </>
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
