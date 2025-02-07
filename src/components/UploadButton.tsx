import { UploadIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useRef } from "react";
import { store } from "@/lib/store";
import { store as componentGraphStore } from "@/lib/graph-store/component";
import { store as statementGraphStore } from "@/lib/graph-store/statement";
import { useToast } from "@/hooks/use-toast";
import { csvParse } from "d3-dsv";
import { read as readXLSX, utils as utilsXLSX } from "xlsx";
import { Statements, statementsSchema } from "@/lib/schema";
import { load } from "@/lib/io";
import { ZodError } from "zod";

async function processJSONFile(file: File) {
  const content = await file.text();
  const state = JSON.parse(content);
  // TODO validate state using zod
  componentGraphStore.setState({
    nodes: state.graph.component.nodes,
    edges: state.graph.component.edges,
  });
  statementGraphStore.setState({
    nodes: state.graph.statement.nodes,
    edges: state.graph.statement.edges,
  });
  store.setState({
    projectName: projectNameFromFile(file),
    statements: state.statements,
    connections: state.connections,
    conflicts: state.conflicts,
  });
}

/**
 * If object in array is missing an id, generate one based on its index.
 *
 * @param data
 * @returns
 */
function fillIds(data: Statements) {
  return data.map((row, index) => {
    return {
      Id: (index + 1).toString(),
      ...row,
    };
  });
}

async function processCSVFile(file: File) {
  const content = await file.text();
  const rawStatements = csvParse(content);

  const statements = statementsSchema.parse(rawStatements);

  const statementsWithIds = fillIds(statements);

  load(statementsWithIds, []);
}

/**
 * Reads a xlsx file and processes it.
 *
 * Expects
 * - first sheet to have the statents.
 * - first row to have the column names.
 *
 * @param file A xlsx file.
 */
async function processXLXSFile(file: File) {
  const content = await file.arrayBuffer();
  const workbook = readXLSX(content);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawStatements = utilsXLSX.sheet_to_json(sheet, { defval: "" });
  const statements = statementsSchema.parse(rawStatements);

  const statementsWithIds = fillIds(statements);

  load(statementsWithIds, []);
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

function userFriendlyError(error: unknown) {
  if (error instanceof ZodError) {
    // If column is missing then do not report error for each row, but only once.
    const uniqueErrors = new Set(
      error.issues.map((e) => {
        if (Array.isArray(e.path)) {
          if (e.path.length === 2) {
            return `${e.path[1]} column ${e.message}`;
          }
          return `${e.path.join(",")} column ${e.message}`;
        }
        return e.message;
      }),
    );
    return (
      <ul className="list-inside list-disc">
        {Array.from(uniqueErrors).map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An error occurred";
}

export function UploadButton() {
  const uploadRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  async function uploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await processFile(file);
      toast({ title: "File uploaded successfully" });
    } catch (error) {
      const description = userFriendlyError(error);
      toast({
        title: "Error uploading file",
        variant: "destructive",
        description: (
          <>
            {description}
            <p className="mt-2">
              Make sure you use the right column seperator and column names.
            </p>
          </>
        ),
      });
      console.error(error);
    }
  }

  return (
    <Button
      variant="outline"
      onClick={() => uploadRef.current?.click()}
      title="Upload a JSON or CSV or XSLX file"
    >
      <UploadIcon />
      <span>Upload file</span>
      <input
        ref={uploadRef}
        type="file"
        tabIndex={-1}
        accept="application/json, .json, text/csv, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .xslx"
        onChange={uploadFile}
        style={{
          display: "none",
        }}
      />
    </Button>
  );
}
