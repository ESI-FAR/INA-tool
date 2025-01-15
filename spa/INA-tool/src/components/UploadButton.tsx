import { UploadIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useRef } from "react";
import { store } from "@/store";
import { useToast } from "@/hooks/use-toast";
import { csvParse } from "d3-dsv";
import { Statements, statementsSchema } from "@/lib/schema";

async function processJSONFile(file: File) {
  const content = await file.text();
  const state = JSON.parse(content);
  // TODO validate state using zod
  store.setState(state);
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
  store.getState().setStatements(statementsWithIds);
}

async function processFile(file: File) {
  store.getState().setProjectName(file.name);
  if (file.type === "application/json") {
    return processJSONFile(file);
  } else if (file.type === "text/csv") {
    return processCSVFile(file);
  } else {
    throw new Error("Unsupported file type");
  }
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
      toast({ title: "Error uploading file", variant: "destructive" });
      console.error(error);
    }
  }

  return (
    <Button
      variant="outline"
      onClick={() => uploadRef.current?.click()}
      title="Upload a JSON or CSV file"
    >
      <UploadIcon />
      <span>Upload file</span>
      <input
        ref={uploadRef}
        type="file"
        tabIndex={-1}
        accept="application/json, .json, text/csv, .csv"
        onChange={uploadFile}
        style={{
          display: "none",
        }}
      />
    </Button>
  );
}
