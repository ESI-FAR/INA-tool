import { store } from "@/stores/global";
import { ConnectionWithValues, drivenbySchema } from "./schema";
import type { Connection as ReactFlowConnection } from "@xyflow/react";

export function reactFlowConnection2PossibleConnections(
  connection: ReactFlowConnection,
): ConnectionWithValues[] {
  // The source statement can have multiple components, we need to return all possible connections
  const sourceStatement = store
    .getState()
    .statements.find((s) => s.Id === connection.source);
  const targetStatement = store
    .getState()
    .statements.find((s) => s.Id === connection.target);
  if (!sourceStatement || !connection.targetHandle || !targetStatement) {
    return [];
  }
  const driven_by = drivenbySchema.parse(connection.targetHandle);
  const connections: ConnectionWithValues[] = [];
  if (driven_by === "actor") {
    if (
      sourceStatement["Direct Object"] &&
      sourceStatement["Type of Direct Object"] === "animate"
    ) {
      connections.push({
        source_statement: connection.source,
        source_component: "Direct Object",
        source_value: sourceStatement["Direct Object"],
        target_statement: connection.target,
        target_component: "Attribute",
        target_value: targetStatement["Attribute"],
        driven_by,
      });
    }
    if (
      sourceStatement["Indirect Object"] &&
      sourceStatement["Type of Indirect Object"] === "animate"
    ) {
      connections.push({
        source_statement: connection.source,
        source_component: "Indirect Object",
        source_value: sourceStatement["Indirect Object"],
        target_statement: connection.target,
        target_component: "Attribute",
        target_value: targetStatement["Attribute"],
        driven_by,
      });
    }
    if (sourceStatement["Execution Constraint"]) {
      connections.push({
        source_statement: connection.source,
        source_component: "Execution Constraint",
        source_value: sourceStatement["Execution Constraint"],
        target_statement: connection.target,
        target_component: "Attribute",
        target_value: targetStatement["Attribute"],
        driven_by,
      });
    }
  } else if (driven_by === "outcome") {
    if (
      sourceStatement["Direct Object"] &&
      sourceStatement["Type of Direct Object"] === "inanimate" &&
      targetStatement["Activation Condition"]
    ) {
      connections.push({
        source_statement: connection.source,
        source_component: "Direct Object",
        source_value: sourceStatement["Direct Object"],
        target_statement: connection.target,
        target_component: "Activation Condition",
        target_value: targetStatement["Activation Condition"],
        driven_by,
      });
    }
    if (
      sourceStatement["Indirect Object"] &&
      sourceStatement["Type of Indirect Object"] === "inanimate" &&
      targetStatement["Activation Condition"]
    ) {
      connections.push({
        source_statement: connection.source,
        source_component: "Indirect Object",
        source_value: sourceStatement["Indirect Object"],
        target_statement: connection.target,
        target_component: "Activation Condition",
        target_value: targetStatement["Activation Condition"],
        driven_by,
      });
    }
  } else if (
    driven_by === "sanction" &&
    targetStatement["Activation Condition"]
  ) {
    connections.push({
      source_statement: connection.source,
      source_component: "Aim",
      source_value: sourceStatement["Aim"],
      target_statement: connection.target,
      target_component: "Activation Condition",
      target_value: targetStatement["Activation Condition"],
      driven_by,
    });
  }
  return connections;
}
