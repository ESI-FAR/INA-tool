import { Conflicts } from "@/lib/schema";
import { loadConflicts, parseFile } from "@/lib/io";
import { AbstractUploadButton } from "./AbstractUploadButton";

async function processFile(file: File) {
  const conflicts = await parseFile(file, Conflicts);
  loadConflicts(conflicts);
}

export function UploadConflictButton() {
  return (
    <AbstractUploadButton
      processFile={processFile}
      help="Make sure you use the right column seperator and column names. Also make sure statements mentioned in upload are present."
      accept="text/csv, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .xslx"
      title="Upload a CSV or XLSX file"
    />
  );
}
