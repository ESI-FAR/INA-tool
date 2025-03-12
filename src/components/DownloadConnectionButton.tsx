import { DownloadIcon } from "lucide-react";
import { Button } from "./ui/button";
import { store } from "@/stores/global";
import { downloadCsvFile } from "@/lib/io";
import { connectionColumns } from "@/lib/schema";

function downloadCSV() {
  downloadCsvFile(
    store.getState().connections,
    connectionColumns,
    "connections",
  );
}

export function DownloadConnectionButton() {
  return (
    <Button variant="outline" onClick={downloadCSV}>
      <DownloadIcon />
      Download
    </Button>
  );
}
