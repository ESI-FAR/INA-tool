import { DownloadIcon } from "lucide-react";
import { Button } from "./ui/button";
import { conflictColumns } from "@/lib/schema.ts";
import { store } from "@/stores/global.ts";
import { download, save } from "@/lib/io.ts";
import { csvFormat } from "d3-dsv";

function downloadCSV() {
  const file = createCsvFile();
  download(file);
}

function createCsvFile() {
  const projectName = store.getState().projectName;
  const fn = projectName
    ? `${projectName}.conflicts.csv`
    : "INA-tool.conflicts.csv";
  const { conflicts } = save();
  const content = csvFormat(conflicts, conflictColumns);
  return new File([content], fn, { type: "text/csv" });
}

export function DownloadConflictButton() {
  return (
    <Button variant="outline" onClick={downloadCSV}>
      <DownloadIcon />
      Download
    </Button>
  );
}
