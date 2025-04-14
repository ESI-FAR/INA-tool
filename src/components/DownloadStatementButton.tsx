import { DownloadIcon } from "lucide-react";
import { Button } from "./ui/button";
import { downloadCsvFile, getSanctionedStatements } from "@/lib/io";
import { statementColumns } from "@/lib/schema";
import { store } from "@/stores/global";

function downloadCSV() {
  const sanctionedStatements = getSanctionedStatements(
    store.getState().statements,
    store.getState().connections,
  );
  downloadCsvFile(sanctionedStatements, statementColumns, "statements");
}

export function DownloadStatementButton() {
  return (
    <Button variant="outline" onClick={downloadCSV}>
      <DownloadIcon />
      Download
    </Button>
  );
}
