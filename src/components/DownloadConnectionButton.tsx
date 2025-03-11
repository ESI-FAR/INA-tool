import { DownloadIcon } from "lucide-react";
import { Button } from "./ui/button";
import { store } from "@/stores/global";
import { csvFormat } from "d3-dsv";
import { download, save } from "@/lib/io";
import { connectionColumns } from "@/lib/schema";

function downloadCSV() {
  const file = createCsvFile();
  download(file);
}

function createCsvFile() {
  const projectName = store.getState().projectName;
  const fn = projectName
    ? `${projectName}.connections.csv`
    : "INA-tool.connections.csv";
  const { connections } = save();
  const content = csvFormat(connections, connectionColumns);
  return new File([content], fn, { type: "text/csv" });
}

export function DownloadConnectionButton() {
  return (
    <Button variant="outline" onClick={downloadCSV}>
      <DownloadIcon />
      Download
    </Button>
  );
}
