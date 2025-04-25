import { store } from "@/stores/global";
import {
  ConnectionWithValues,
  DrivenBy,
  drivenbySchema,
  Statement,
} from "./schema";
import type { Connection as ReactFlowConnection } from "@xyflow/react";

export function reactFlowConnection2PossibleConnections(
  connection: ReactFlowConnection,
): ConnectionWithValues[] {
  // The source statement can have multiple components, we need to return all possible connections
  const driven_by = drivenbySchema.parse(connection.targetHandle);
  return statementIdPair2PossibleConnections(
    connection.source,
    connection.target,
    driven_by,
  );
}

export function statementIdPair2PossibleConnections(
  sourceStatementId: string,
  targetStatementId: string,
  driven_by: DrivenBy,
) {
  const sourceStatement = store
    .getState()
    .statements.find((s) => s.Id === sourceStatementId);
  const targetStatement = store
    .getState()
    .statements.find((s) => s.Id === targetStatementId);
  if (!sourceStatement || !targetStatement) {
    return [];
  }
  return statementPair2PossibleConnections(
    sourceStatement,
    targetStatement,
    driven_by,
  );
}

export function statementPair2PossibleConnections(
  sourceStatement: Statement,
  targetStatement: Statement,
  driven_by?: DrivenBy | undefined,
) {
  const connections: ConnectionWithValues[] = [];
  if (driven_by === "actor" || driven_by === undefined) {
    if (
      sourceStatement["Direct Object"] &&
      sourceStatement["Type of Direct Object"] === "animate"
    ) {
      connections.push({
        source_statement: sourceStatement.Id,
        source_component: "Direct Object",
        source_value: sourceStatement["Direct Object"],
        target_statement: targetStatement.Id,
        target_component: "Attribute",
        target_value: targetStatement["Attribute"],
        driven_by: "actor",
      });
    }
    if (
      sourceStatement["Indirect Object"] &&
      sourceStatement["Type of Indirect Object"] === "animate"
    ) {
      connections.push({
        source_statement: sourceStatement.Id,
        source_component: "Indirect Object",
        source_value: sourceStatement["Indirect Object"],
        target_statement: targetStatement.Id,
        target_component: "Attribute",
        target_value: targetStatement["Attribute"],
        driven_by: "actor",
      });
    }
    if (sourceStatement["Execution Constraint"]) {
      connections.push({
        source_statement: sourceStatement.Id,
        source_component: "Execution Constraint",
        source_value: sourceStatement["Execution Constraint"],
        target_statement: targetStatement.Id,
        target_component: "Attribute",
        target_value: targetStatement["Attribute"],
        driven_by: "actor",
      });
    }
  }
  if (driven_by === "outcome" || driven_by === undefined) {
    if (
      sourceStatement["Direct Object"] &&
      sourceStatement["Type of Direct Object"] === "inanimate" &&
      targetStatement["Activation Condition"]
    ) {
      connections.push({
        source_statement: sourceStatement.Id,
        source_component: "Direct Object",
        source_value: sourceStatement["Direct Object"],
        target_statement: targetStatement.Id,
        target_component: "Activation Condition",
        target_value: targetStatement["Activation Condition"],
        driven_by: "outcome",
      });
    }
    if (
      sourceStatement["Indirect Object"] &&
      sourceStatement["Type of Indirect Object"] === "inanimate" &&
      targetStatement["Activation Condition"]
    ) {
      connections.push({
        source_statement: sourceStatement.Id,
        source_component: "Indirect Object",
        source_value: sourceStatement["Indirect Object"],
        target_statement: targetStatement.Id,
        target_component: "Activation Condition",
        target_value: targetStatement["Activation Condition"],
        driven_by: "outcome",
      });
    }
    if (
      sourceStatement["Execution Constraint"] &&
      targetStatement["Activation Condition"]
    ) {
      connections.push({
        source_statement: sourceStatement.Id,
        source_component: "Execution Constraint",
        source_value: sourceStatement["Execution Constraint"],
        target_statement: targetStatement.Id,
        target_component: "Activation Condition",
        target_value: targetStatement["Activation Condition"],
        driven_by: "outcome",
      });
    }
  }
  if (
    (driven_by === "sanction" || driven_by === undefined) &&
    targetStatement["Activation Condition"]
  ) {
    connections.push({
      source_statement: sourceStatement.Id,
      source_component: "Aim",
      source_value: sourceStatement["Aim"],
      target_statement: targetStatement.Id,
      target_component: "Activation Condition",
      target_value: targetStatement["Activation Condition"],
      driven_by: "sanction",
    });
  }
  return connections;
}
