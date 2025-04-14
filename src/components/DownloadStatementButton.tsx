import { DownloadIcon } from "lucide-react";
import { Button } from "./ui/button";
import { downloadCsvFile } from "@/lib/io";
import { Statement, statementColumns } from "@/lib/schema";

function downloadCSV(statements: Statement[]) {
  downloadCsvFile(statements, statementColumns, "statements");
}

export function DownloadStatementButton({
  statements,
}: {
  statements: Statement[];
}) {
  return (
    <Button variant="outline" onClick={() => downloadCSV(statements)}>
      <DownloadIcon />
      Download
    </Button>
  );
}
