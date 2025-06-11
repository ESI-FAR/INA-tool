import { Conflicts } from "@/lib/schema";
import { AbstractUploadButton } from "./AbstractUploadButton";
import { store } from "@/stores/global";
import { ZodIssueCode } from "zod";

async function processFile(file: File) {
  const ConflictsWithStatementCheck = Conflicts.superRefine((val, ctx) => {
    const knownStatementIds = new Set(
      store.getState().statements.map((s) => s.Id),
    );
    for (const conflict of val) {
      const group = conflict.group;
      const statementIds = conflict.statements;
      for (const statementId of statementIds) {
        if (!knownStatementIds.has(statementId)) {
          ctx.addIssue({
            code: ZodIssueCode.custom,
            message: `Statement ${statementId} in conflict group ${group} can not be found`,
          });
        }
      }
    }
  });

  const content = await file.text();
  const rawData = JSON.parse(content);
  const conflicts = ConflictsWithStatementCheck.parse(rawData);
  store.getState().setConflicts(conflicts);
}

export function UploadConflictButton() {
  return (
    <AbstractUploadButton
      processFile={processFile}
      help="Make sure you use the right column seperator and column names. Also make sure statements mentioned in upload are present."
      accept="application/json"
      title="Upload a JSON file"
    />
  );
}
