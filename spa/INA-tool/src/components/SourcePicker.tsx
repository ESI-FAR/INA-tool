import { store } from "@/lib/store";
import { useStore } from "zustand";
import { Connection } from "@xyflow/react";
import { INANode } from "./nodes";
import { edgeTypes, INAEdge, isDrivenConnectionEdge } from "./edges";
import { useMemo } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { isStatementNode } from "@/lib/io";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Statement } from "@/lib/schema";

interface SourceChoice {
  type: string;
  label: string;
  value: string;
}

function findSourceChoices(
  connection: Connection,
  nodes: INANode[],
): SourceChoice[] {
  const sourceNode = nodes.find((node) => node.id === connection.source);
  if (!sourceNode || !isStatementNode(sourceNode)) {
    return [];
  }
  const type = connection.targetHandle as keyof typeof edgeTypes;
  const statement = sourceNode.data.raw;
  return deriveSourceChoices(statement, type);
}

// eslint-disable-next-line react-refresh/only-export-components
export function deriveSourceChoices(statement: Statement, type: string) {
  const choices: SourceChoice[] = [];
  const id = statement.Id!;
  // for each type return choice if it is present
  if (type === "actor-driven") {
    if (
      statement["Direct Object"] &&
      statement["Type of Direct Object"] === "animate"
    ) {
      choices.push({
        type: id + "-direct-object",
        label: "Direct Object",
        value: statement["Direct Object"],
      });
    }
    if (
      statement["Indirect Object"] &&
      statement["Type of Indirect Object"] === "animate"
    ) {
      choices.push({
        type: id + "-indirect-object",
        label: "Indirect Object",
        value: statement["Indirect Object"],
      });
    }
    if (statement["Execution Constraint"]) {
      choices.push({
        type: id + "-execution-constraint",
        label: "Execution Constraint",
        value: statement["Execution Constraint"],
      });
    }
  } else if (type === "outcome-driven") {
    if (
      statement["Direct Object"] &&
      statement["Type of Direct Object"] === "inanimate"
    ) {
      choices.push({
        type: id + "-direct-object",
        label: "Direct Object",
        value: statement["Direct Object"],
      });
    }
    if (
      statement["Indirect Object"] &&
      statement["Type of Indirect Object"] === "inanimate"
    ) {
      choices.push({
        type: id + "-indirect-object",
        label: "Indirect Object",
        value: statement["Indirect Object"],
      });
    }
  } else if (type === "sanction-driven") {
    choices.push({
      type: id + "-aim",
      label: "Aim",
      value: statement["Aim"],
    });
  }

  return choices;
}

function findUncompactTarget(edge: INAEdge | Connection) {
  const id = edge.target;
  const type = edge.targetHandle as keyof typeof edgeTypes;
  switch (type) {
    case "actor-driven":
      return id + "-attribute";
    case "outcome-driven":
      return id + "-activation-condition";
    case "sanction-driven":
      return id + "-activation-condition";
    default:
      throw new Error("Unreachable code");
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export function hasAmbiguousSource(connection: Connection, nodes: INANode[]) {
  const sourceNode = nodes.find((node) => node.id === connection.source);
  if (!sourceNode || !isStatementNode(sourceNode)) {
    return false;
  }
  const type = connection.targetHandle as keyof typeof edgeTypes;
  const statement = sourceNode.data.raw;
  if (type === "actor-driven") {
    const hassDirectAnimate =
      statement["Direct Object"] &&
      statement["Type of Direct Object"] === "animate";
    const hasInDirectAnimate =
      statement["Indirect Object"] &&
      statement["Type of Indirect Object"] === "animate";
    const hasExecutionConstraint = statement["Execution Constraint"];
    // If more than one has* is true, then it is ambiguous
    return (
      (hassDirectAnimate && hasInDirectAnimate) ||
      (hassDirectAnimate && hasExecutionConstraint) ||
      (hasInDirectAnimate && hasExecutionConstraint)
    );
  } else if (type === "outcome-driven") {
    const hasDirectInanimate =
      statement["Direct Object"] &&
      statement["Type of Direct Object"] === "inanimate";
    const hasInDirectInanimate =
      statement["Indirect Object"] &&
      statement["Type of Indirect Object"] === "inanimate";
    // If more than one has* is true, then it is ambiguous
    return hasDirectInanimate && hasInDirectInanimate;
  } else if (type === "sanction-driven") {
    // Aim is required so never ambiguous
    return false;
  }
  throw new Error("Unreachable code");
}

// eslint-disable-next-line react-refresh/only-export-components
export function setUncompactSource(edge: INAEdge, nodes: INANode[]) {
  const statementId = edge.source;
  const node = nodes.find((node) => node.id === statementId);
  if (!node || !isStatementNode(node) || !isDrivenConnectionEdge(edge)) {
    return;
  }
  const type = edge.targetHandle as keyof typeof edgeTypes;
  const statement = node.data.raw;
  if (type === "actor-driven") {
    if (
      statement["Direct Object"] &&
      statement["Type of Direct Object"] === "animate"
    ) {
      edge.uncompactSource = statementId + "-direct-object";
      return;
    }
    if (
      statement["Indirect Object"] &&
      statement["Type of Indirect Object"] === "animate"
    ) {
      edge.uncompactSource = statementId + "-indirect-object";
      return;
    }
    if (statement["Execution Constraint"]) {
      edge.uncompactSource = statementId + "-execution-constraint";
      return;
    }
  } else if (type === "outcome-driven") {
    if (
      statement["Direct Object"] &&
      statement["Type of Direct Object"] === "inanimate"
    ) {
      edge.uncompactSource = statementId + "-direct-object";
      return;
    }
    if (
      statement["Indirect Object"] &&
      statement["Type of Indirect Object"] === "inanimate"
    ) {
      edge.uncompactSource = statementId + "-indirect-object";
      return;
    }
  } else if (type === "sanction-driven") {
    edge.uncompactSource = statementId + "-aim";
    return;
  }
  throw new Error("Unreachable code");
}

// eslint-disable-next-line react-refresh/only-export-components
export function setUncompactTarget(edge: INAEdge) {
  if (!isDrivenConnectionEdge(edge)) {
    return;
  }
  edge.uncompactTarget = findUncompactTarget(edge);
}

/**
 * In compact mode you can not see to which inner statement node an edge is connected.
 * This component allows the user to pick the source of the connection.
 */
export function SourcePicker({
  connection,
  onPick,
  onCancel,
}: {
  connection: Connection;
  onPick: (source: string, target: string) => void;
  onCancel: () => void;
}) {
  const nodes = useStore(store, (state) => state.nodes);
  const choices = useMemo(() => {
    if (!connection) {
      return [];
    }
    return findSourceChoices(connection, nodes);
  }, [connection, nodes]);

  function onOpenChange(open: boolean) {
    if (!open) {
      onCancel();
    }
  }

  return (
    <Dialog defaultOpen={true} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="text-xl">
          The source of the connection is ambiguous. Please select a source
        </DialogTitle>
        <RadioGroup
          onValueChange={(value) =>
            onPick(value, findUncompactTarget(connection!))
          }
        >
          {choices.map((choice) => (
            <div key={choice.type} className="flex items-center space-x-2">
              <RadioGroupItem value={choice.type} id={choice.type} />
              <Label htmlFor={choice.type}>
                {choice.label}: {choice.value}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </DialogContent>
    </Dialog>
  );
}
