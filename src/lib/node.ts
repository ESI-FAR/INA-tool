import { Node } from "@xyflow/react";
import { Statement } from "./schema";

export type StatementNode = Node<
  { raw: Statement; label: string },
  "statement"
>;
export type AttributeNode = Node<{ label: string }, "Attribute">;
export type AimNode = Node<{ label: string }, "Aim">;
export type DirectObjectNode = Node<
  { animation?: string; label: string },
  "Direct Object"
>;
export type InDirectObjectNode = Node<
  { animation?: string; label: string },
  "Indirect Object"
>;
export type ActivationConditionNode = Node<
  { label: string },
  "Activation Condition"
>;
export type ExecutionConstraintNode = Node<
  { label: string },
  "Execution Constraint"
>;

export type ConflictGroupNode = Node<Record<string, never>, "conflict">;

export type ComponentNode =
  | AttributeNode
  | AimNode
  | DirectObjectNode
  | InDirectObjectNode
  | ActivationConditionNode
  | ExecutionConstraintNode;

export type StatementRelatedNode = ComponentNode | StatementNode;
export type INANode = StatementNode | ComponentNode | ConflictGroupNode;

export function isStatementNode(node: Node): node is StatementNode {
  return node.type === "statement";
}

export function isComponentNode(node: INANode): node is ComponentNode {
  return (
    node.type === "Attribute" ||
    node.type === "Aim" ||
    node.type === "Direct Object" ||
    node.type === "Indirect Object" ||
    node.type === "Activation Condition" ||
    node.type === "Execution Constraint"
  );
}

export function isConflictGroupNode(node: INANode): node is ConflictGroupNode {
  return node.type === "conflict";
}
