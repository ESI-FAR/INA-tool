import { DownloadIcon } from "lucide-react";
import { Button } from "./ui/button";
import { csvFormat } from "d3-dsv";
import { download, save } from "@/lib/io";
import { statementColumns } from "@/lib/schema";
import { getProject } from "@/hooks/useProjectName";

function downloadCSV() {
  const file = createCsvFile();
  download(file);
}

function createCsvFile() {
  const projectName = getProject();
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
