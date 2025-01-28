import { UploadIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { csvParse } from "d3-dsv";
import { read as readXLSX, utils as utilsXLSX } from "xlsx";
import { connectionsSchema } from "@/lib/schema";
import { ZodError } from "zod";
import { loadConnections } from "@/lib/io";

async function processCSVFile(file: File) {
  const content = await file.text();
  const rawStatements = csvParse(content);

  const connections = connectionsSchema.parse(rawStatements);
  loadConnections(connections);
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
  const connections = connectionsSchema.parse(rawStatements);
  loadConnections(connections);
}

async function processFile(file: File) {
  if (file.type === "text/csv" || file.name.endsWith(".csv")) {
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

export function UploadConnectionButton() {
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
              Also make sure statements and nodes mentioned in upload are
              present.
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
      title="Upload a CSV or XLSX file"
    >
      <UploadIcon />
      <span>Upload</span>
      <input
        ref={uploadRef}
        type="file"
        tabIndex={-1}
        accept="text/csv, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .xslx"
        onChange={uploadFile}
        style={{
          display: "none",
        }}
      />
    </Button>
  );
}
