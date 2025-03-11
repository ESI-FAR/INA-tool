import { connectionsSchema } from "@/lib/schema";
import { loadConnections, parseFile } from "@/lib/io";
import { AbstractUploadButton } from "./AbstractUploadButton";

async function processFile(file: File) {
  const connections = await parseFile(file, connectionsSchema);
  loadConnections(connections);
}

export function UploadConnectionButton() {
  return (
    <AbstractUploadButton
      processFile={processFile}
      help="Make sure you use the right column seperator and column names. Also make sure statements and components mentioned in upload are present."
      accept="text/csv, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .xslx"
      title="Upload a CSV or XLSX file"
    />
  );
}
