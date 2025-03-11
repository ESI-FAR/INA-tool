import { store } from "@/stores/global";
import {
  Statement,
  StatementsWithOptionalId,
  statementsSchema,
} from "@/lib/schema";
import { loadStatements, parseCsvFile, parseXLSXFile } from "@/lib/io";
import { json2project } from "@/lib/project2json";
import { AbstractUploadButton } from "./AbstractUploadButton";

async function processJSONFile(file: File) {
  const content = await file.text();
  const projectName = projectNameFromFile(file);
  json2project(content, projectName);
}

/**
 * If object in array is missing an id, generate one based on its index.
 *
 * @param data
 * @returns
 */
function fillIds(data: StatementsWithOptionalId): Statement[] {
  return data.map((row, index) => {
    return {
      Id: (index + 1).toString(),
      ...row,
    };
  });
}

async function processCSVFile(file: File) {
  const statements = await parseCsvFile(file, statementsSchema);
  const statementsWithIds = fillIds(statements);
  loadStatements(statementsWithIds);
}

async function processXLXSFile(file: File) {
  const statements = await parseXLSXFile(file, statementsSchema);
  const statementsWithIds = fillIds(statements);
  loadStatements(statementsWithIds);
}

function projectNameFromFile(file: File) {
  return file.name.replace(/\.[^/.]+$/, "");
}

async function processFile(file: File) {
  store.getState().setProjectName(projectNameFromFile(file));
  if (file.type === "application/json" || file.name.endsWith(".json")) {
    return processJSONFile(file);
  } else if (file.type === "text/csv" || file.name.endsWith(".csv")) {
    return processCSVFile(file);
  } else if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.name.endsWith(".xlsx")
  ) {
    return processXLXSFile(file);
  } else {
    throw new Error("Unsupported file type");
  }
}

export function UploadButton() {
  return (
    <AbstractUploadButton
      processFile={processFile}
      help="Make sure you use the right column seperator and column names."
      accept="application/json, .json, text/csv, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .xslx"
      title="Upload a JSON or CSV or XSLX file"
    />
  );
}
