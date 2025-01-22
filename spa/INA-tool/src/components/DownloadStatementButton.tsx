import { DownloadIcon } from "lucide-react";
import { Button } from "./ui/button";
import { store } from "@/lib/store";
import { csvFormat } from "d3-dsv";
import { download, save } from "@/lib/io";
import { statementColumns } from "@/lib/schema";

function downloadCSV() {
  const file = createCsvFile();
  download(file);
}

function createCsvFile() {
  const projectName = store.getState().projectName;
  const fn = projectName ? `${projectName}.csv` : "INA-tool.csv";
  const { statements } = save();
  const content = csvFormat(statements, statementColumns);
  return new File([content], fn, { type: "text/csv" });
}

export function DownloadStatementButton() {
  return (
    <Button variant="outline" onClick={downloadCSV}>
      <DownloadIcon />
      Download as CSV
    </Button>
  );
}
