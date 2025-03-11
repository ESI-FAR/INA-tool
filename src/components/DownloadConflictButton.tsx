import { DownloadIcon } from "lucide-react";
import { Button } from "./ui/button";
import { conflictColumns } from "@/lib/schema.ts";
import { store } from "@/stores/global.ts";
import { downloadCsvFile } from "@/lib/io.ts";

function downloadCSV() {
  downloadCsvFile(store.getState().conflicts, conflictColumns, "conflicts");
}

export function DownloadConflictButton() {
  return (
    <Button variant="outline" onClick={downloadCSV}>
      <DownloadIcon />
      Download
    </Button>
  );
}
