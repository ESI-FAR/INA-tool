import { DownloadIcon } from "lucide-react";
import { Button } from "./ui/button";
import { store } from "@/stores/global";
import { downloadCsvFile } from "@/lib/io";
import { statementColumns } from "@/lib/schema";

function downloadCSV() {
  downloadCsvFile(store.getState().statements, statementColumns, "statements");
}

export function DownloadStatementButton() {
  return (
    <Button variant="outline" onClick={downloadCSV}>
      <DownloadIcon />
      Download
    </Button>
  );
}
