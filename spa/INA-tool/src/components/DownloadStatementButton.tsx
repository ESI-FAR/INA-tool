import { DownloadIcon } from "lucide-react";
import { Button } from "./ui/button";
import { store } from "@/store";
import { csvFormat } from "d3-dsv";
import { Statement } from "@/lib/schema";

function spacify(rows: Statement[]) {
  return rows.map((row) => {
    return {
      Id: row.id,
      "Statement Type": row.statementType,
      Attribute: row.attribute,
      Deontic: row.deontic,
      Aim: row.aim,
      "Direct Object": row.directObject,
      "Type Of Direct Object": row.typeOfDirectObject,
      "Indirect Object": row.indirectObject,
      "Type Of Indirect Object": row.typeOfIndirectObject,
      "Activation Condition": row.activationCondition,
      "Execution Constraint": row.executionConstraint,
      "Or Else": row.orElse,
    };
  });
}

function downloadCSV() {
  const fn = store.getState().projectName;
  const rows = store.getState().statements;
  const content = csvFormat(spacify(rows));
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fn.endsWith(".csv") ? fn : `${fn}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}

export function DownloadStatementButton() {
  return (
    <Button variant="outline" onClick={downloadCSV}>
      <DownloadIcon />
      Download as CSV
    </Button>
  );
}
