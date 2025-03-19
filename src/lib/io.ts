import {
  ActivationConditionNode,
  AimNode,
  AttributeNode,
  DirectObjectNode,
  ExecutionConstraintNode,
  INANode,
  InDirectObjectNode,
  isStatementNode,
  StatementNode,
  StatementRelatedNode,
} from "./node";
import { Statement } from "./schema";
import { ComponentEdge } from "./edge";
import { store } from "../stores/global";
import { ZodType } from "zod";
import { read as readXLSX, utils as utilsXLSX } from "xlsx";
import { csvFormat, csvParse } from "d3-dsv";
import { statementLabel } from "./utils";

export const DEFAULT_STATEMENT_HEIGHT = 180;

export function procesStatement(
  statement: Statement,
  fallBackId: string,
): [StatementRelatedNode[], ComponentEdge[]] {
  const nodes: StatementRelatedNode[] = [];
  const edges: ComponentEdge[] = [];
  const id = statement.Id || fallBackId;
  const label = statementLabel(statement);
  const statementNode: StatementNode = {
    id,
    type: "statement",
    data: { raw: statement, label },
    position: { x: 0, y: 0 },
    style: {
      // TODO make smaller based on content
      width: 940,
      height: DEFAULT_STATEMENT_HEIGHT,
    },
  };
  nodes.push(statementNode);

  const attributeId = `${id}-Attribute`;
  const attributeNode: AttributeNode = {
    id: attributeId,
    type: "Attribute",
    data: { label: statement.Attribute },
    // TODO move right if left node has lots of text
    position: { x: 240, y: 30 },
    parentId: id,
    extent: "parent",
  };
  nodes.push(attributeNode);

  if (statement["Activation Condition"]) {
    const activationConditionId = `${id}-Activation Condition`;
    const activationConditionNode: ActivationConditionNode = {
      id: activationConditionId,
      type: "Activation Condition",
      data: { label: statement["Activation Condition"] },
      position: { x: 10, y: 30 },
      parentId: id,
      extent: "parent",
    };
    nodes.push(activationConditionNode);
    const activationConditionEdge: ComponentEdge = {
      id: `${id}-activation-condition-2-attribute`,
      data: {
        statementId: id,
      },
      source: activationConditionId,
      target: attributeId,
      sourceHandle: "statement",
      targetHandle: "statement",
      type: "component",
    };
    edges.push(activationConditionEdge);
  }

  const aimId = `${id}-Aim`;
  const aimNode: AimNode = {
    id: aimId,
    type: "Aim",
    data: { label: statement.Aim },
    position: { x: 480, y: 30 },
    parentId: id,
    extent: "parent",
  };
  nodes.push(aimNode);
  const aimEdge: ComponentEdge = {
    id: `${id}-attribute-2-aim`,
    data: {
      statementId: id,
    },
    source: attributeId,
    target: aimId,
    label: statement.Deontic,
    sourceHandle: "statement",
    targetHandle: "statement",
    type: "component",
  };
  edges.push(aimEdge);

  if (statement["Direct Object"]) {
    const directObjectId = `${id}-Direct Object`;
    const directObjectNode: DirectObjectNode = {
      id: directObjectId,
      type: "Direct Object",
      data: {
        label: statement["Direct Object"],
        animation: statement["Type of Direct Object"],
      },
      position: { x: 715, y: 30 },
      parentId: id,
      extent: "parent",
    };
    nodes.push(directObjectNode);
    edges.push({
      id: `${id}-aim-2-direct-object`,
      data: {
        statementId: id,
      },
      source: aimId,
      target: directObjectId,
      sourceHandle: "direct-object",
      targetHandle: "statement",
      type: "component",
    });

    if (statement["Indirect Object"]) {
      const indirectObjectId = `${id}-Indirect Object`;
      const indirectObjectNode: InDirectObjectNode = {
        id: indirectObjectId,
        data: {
          label: statement["Indirect Object"],
          animation: statement["Type of Indirect Object"],
        },
        type: "Indirect Object",
        position: { x: 715, y: 100 },
        parentId: id,
        extent: "parent",
      };
      nodes.push(indirectObjectNode);
      edges.push({
        id: `${id}-direct-object-2-indirect-object`,
        data: {
          statementId: id,
        },
        source: directObjectId,
        target: indirectObjectId,
        sourceHandle: "statement",
        targetHandle: "statement",
        type: "component",
      });
    }
  }
  if (statement["Execution Constraint"]) {
    const executionConstraintId = `${id}-Execution Constraint`;
    const executionConstraintNode: ExecutionConstraintNode = {
      id: executionConstraintId,
      type: "Execution Constraint",
      data: { label: statement["Execution Constraint"] },
      position: { x: 430, y: 100 },
      parentId: id,
      extent: "parent",
    };
    nodes.push(executionConstraintNode);
    // aim 2 execution constraint edge
    edges.push({
      id: `${id}-aim-2-execution-constraint`,
      data: {
        statementId: id,
      },
      source: aimId,
      target: executionConstraintId,
      sourceHandle: "execution-constraint",
      targetHandle: "statement",
      type: "component",
    });
  }

  // TODO how to render 'Or Else'?

  return [nodes, edges];
}

export function deriveStatements(nodes: INANode[]): Statement[] {
  return nodes.filter(isStatementNode).map((node) => node.data.raw);
}

export class InvalidConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidConnectionError";
  }
}

export function offsetStatement(statement: StatementNode, index: number) {
  const gap = 10;
  statement.position.y = index * DEFAULT_STATEMENT_HEIGHT + index * gap;
}

export function download(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}

export function loadStatements(statements: Statement[]) {
  store.getState().setStatements(statements);
  store.getState().setConnections([]);
  store.getState().setConflicts([]);
}

export async function parseCsvFile<T>(
  file: File,
  schema: ZodType<T>,
): Promise<T> {
  const content = await file.text();
  const raw = csvParse(content);
  return schema.parse(raw);
}

/**
 * Reads a xlsx file and processes it.
 *
 * Expects
 * - first sheet to have the data.
 * - first row to have the column names.
 *
 * @param file A xlsx file.
 */
export async function parseXLSXFile<T>(
  file: File,
  schema: ZodType<T>,
): Promise<T> {
  const content = await file.arrayBuffer();
  const workbook = readXLSX(content);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawConnections = utilsXLSX.sheet_to_json(sheet, { defval: "" });
  return schema.parse(rawConnections);
}

export async function parseFile<T>(file: File, schema: ZodType<T>): Promise<T> {
  if (file.type === "text/csv" || file.name.endsWith(".csv")) {
    return parseCsvFile(file, schema);
  } else if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.name.endsWith(".xlsx")
  ) {
    return parseXLSXFile(file, schema);
  } else {
    throw new Error("Unsupported file type");
  }
}

export function downloadCsvFile<T extends object>(
  rows: T[],
  columns: Array<keyof T>,
  suffix: string,
) {
  const projectName = store.getState().projectName;
  const fn = projectName
    ? `${projectName}.${suffix}.csv`
    : `INA-tool.${suffix}.csv`;
  const content = csvFormat(rows, columns);
  const file = new File([content], fn, { type: "text/csv" });
  download(file);
}
