import { connectionsSchema } from "@/lib/schema";
import { AbstractUploadButton } from "./AbstractUploadButton";
import { store } from "@/stores/global";
import { ZodIssueCode } from "zod";
import { parseFile } from "@/lib/io";

async function processFile(file: File) {
  const connectionsSchemaWithStatementComponentCheck =
    connectionsSchema.superRefine((val, ctx) => {
      // check if statement ids exist
      // check if statement has source/target component
      const statementLookup = new Map(
        store.getState().statements.map((s) => [s.Id, s]),
      );
      let i = 0;
      for (const connection of val) {
        const sourceStatement = statementLookup.get(
          connection.source_statement,
        );
        if (!sourceStatement) {
          ctx.addIssue({
            code: ZodIssueCode.custom,
            message: `Source statement ${connection.source_statement} of connection ${i} is not found`,
            path: [i, "source_statement"],
          });
        } else {
          if (sourceStatement[connection.source_component] === undefined) {
            ctx.addIssue({
              code: ZodIssueCode.custom,
              message: `Component ${connection.source_component} of source statement ${connection.source_statement} of connection ${i} is not found `,
              path: [i, "source_component"],
            });
          }
        }
        const targetStatement = statementLookup.get(
          connection.target_statement,
        );
        if (!targetStatement) {
          ctx.addIssue({
            code: ZodIssueCode.custom,
            message: `Target statement ${connection.target_statement} of connection ${i} is not found`,
            path: [i, "target_statement"],
          });
        } else {
          if (targetStatement[connection.target_component] === undefined) {
            ctx.addIssue({
              code: ZodIssueCode.custom,
              message: `Component ${connection.target_component} of target statement ${connection.target_statement} of connection ${i} is not found `,
              path: [i, "target_component"],
            });
          }
        }
        i++;
      }
    });
  const connections = await parseFile(
    file,
    connectionsSchemaWithStatementComponentCheck,
  );

  store.getState().setConnections(connections);
}

export function UploadConnectionButton() {
  return (
    <AbstractUploadButton
      processFile={processFile}
      help="Make sure you use the right column seperator and column names. Also make sure statements and components mentioned in upload are present."
      accept="text/csv, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .xslx"
      title="Upload a CSV or XLSX file"
    />
  );
}
