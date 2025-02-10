import { Node } from "@xyflow/react";
import { CSSProperties } from "react";
import { Statement } from "./schema";

export type StatementNode = Node<
  { raw: Statement; label: string },
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

export type ConflictGroupNode = Node<Record<string, never>, "conflict">;

export type InnerStatementNode =
  | AttributeNode
  | AimNode
  | DirectObjectNode
  | InDirectObjectNode
  | ActivationConditionNode
  | ExecutionConstraintNode;

export type StatementRelatedNode = InnerStatementNode | StatementNode;
export type INANode = StatementNode | InnerStatementNode | ConflictGroupNode;

export function isStatementNode(node: INANode): node is StatementNode {
  return node.type === "statement";
}

export function isInnerStatementNode(
  node: INANode,
): node is InnerStatementNode {
  return (
    node.type === "attribute" ||
    node.type === "aim" ||
    node.type === "direct-object" ||
    node.type === "indirect-object" ||
    node.type === "activation-condition" ||
    node.type === "execution-constraint"
  );
}

export function isConflictGroupNode(node: INANode): node is ConflictGroupNode {
  return node.type === "conflict";
}
