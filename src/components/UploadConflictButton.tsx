import { Conflicts } from "@/lib/schema";
import { parseFile } from "@/lib/io";
import { AbstractUploadButton } from "./AbstractUploadButton";
import { store } from "@/stores/global";
import { ZodIssueCode } from "zod";

async function processFile(file: File) {
  const ConflictsWithStatementCheck = Conflicts.superRefine((val, ctx) => {
    const formalStatementIds = new Set(
      store
        .getState()
        .statements.filter((s) => s["Statement Type"] === "formal")
        .map((s) => s.Id),
    );
    const informalStatementIds = new Set(
      store
        .getState()
        .statements.filter((s) => s["Statement Type"] === "informal")
        .map((s) => s.Id),
    );
    let i = 0;
    for (const conflict of val) {
      if (!formalStatementIds.has(conflict.formal)) {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: `Formal statement ${conflict.formal} of conflict ${i} is not found`,
          path: [i, "formal"],
        });
      }
      if (!informalStatementIds.has(conflict.informal)) {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: `Informal statement ${conflict.informal} of conflict ${i} is not found`,
          path: [i, "informal"],
        });
      }
      i++;
    }
  });

  const conflicts = await parseFile(file, ConflictsWithStatementCheck);

  store.getState().setConflicts(conflicts);
}

export function UploadConflictButton() {
  return (
    <AbstractUploadButton
      processFile={processFile}
      help="Make sure you use the right column seperator and column names. Also make sure statements mentioned in upload are present."
      accept="text/csv, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .xslx"
      title="Upload a CSV or XLSX file"
    />
  );
}
