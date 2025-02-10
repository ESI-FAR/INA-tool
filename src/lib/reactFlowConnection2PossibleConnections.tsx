import { ConnectionWithValues, DriverType } from "./schema";
import { store as globalStore } from "./store";
import type { Connection as ReactFlowConnection } from "@xyflow/react";

export function reactFlowConnection2PossibleConnections(
  connection: ReactFlowConnection,
): ConnectionWithValues[] {
  // The source statement can have multiple nodes, we need to return all possible connections
  const sourceStatement = globalStore
    .getState()
    .statements.find((s) => s.Id === connection.source);
  const targetStatement = globalStore
    .getState()
    .statements.find((s) => s.Id === connection.target);
  if (!sourceStatement || !connection.targetHandle || !targetStatement) {
    return [];
  }
  const driver = DriverType.parse(
    connection.targetHandle.replace("-driven", ""),
  );
  const connections: ConnectionWithValues[] = [];
  if (driver === "actor") {
    if (
      sourceStatement["Direct Object"] &&
      sourceStatement["Type of Direct Object"] === "animate"
    ) {
      connections.push({
        source_statement: connection.source,
        source_node: "direct-object",
        source_value: sourceStatement["Direct Object"],
        target_statement: connection.target,
        target_node: "attribute",
        target_value: targetStatement["Attribute"],
        driver: driver,
      });
    }
    if (
      sourceStatement["Indirect Object"] &&
      sourceStatement["Type of Indirect Object"] === "animate"
    ) {
      connections.push({
        source_statement: connection.source,
        source_node: "indirect-object",
        source_value: sourceStatement["Indirect Object"],
        target_statement: connection.target,
        target_node: "attribute",
        target_value: targetStatement["Attribute"],
        driver: driver,
      });
    }
    if (sourceStatement["Execution Constraint"]) {
      connections.push({
        source_statement: connection.source,
        source_node: "execution-constraint",
        source_value: sourceStatement["Execution Constraint"],
        target_statement: connection.target,
        target_node: "attribute",
        target_value: targetStatement["Attribute"],
        driver: driver,
      });
    }
  } else if (driver === "outcome") {
    if (
      sourceStatement["Direct Object"] &&
      sourceStatement["Type of Direct Object"] === "inanimate" &&
      targetStatement["Activation Condition"]
    ) {
      connections.push({
        source_statement: connection.source,
        source_node: "direct-object",
        source_value: sourceStatement["Direct Object"],
        target_statement: connection.target,
        target_node: "activation-condition",
        target_value: targetStatement["Activation Condition"],
        driver: driver,
      });
    }
    if (
      sourceStatement["Indirect Object"] &&
      sourceStatement["Type of Indirect Object"] === "inanimate" &&
      targetStatement["Activation Condition"]
    ) {
      connections.push({
        source_statement: connection.source,
        source_node: "indirect-object",
        source_value: sourceStatement["Indirect Object"],
        target_statement: connection.target,
        target_node: "activation-condition",
        target_value: targetStatement["Activation Condition"],
        driver: driver,
      });
    }
  } else if (driver === "sanction" && targetStatement["Activation Condition"]) {
    connections.push({
      source_statement: connection.source,
      source_node: "aim",
      source_value: sourceStatement["Aim"],
      target_statement: connection.target,
      target_node: "activation-condition",
      target_value: targetStatement["Activation Condition"],
      driver: driver,
    });
  }
  return connections;
}
