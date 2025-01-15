import { z } from "zod";

const statementSchema = z.object({
  Id: z.string().optional(),
  "Statement Type": z.string(),
  Attribute: z.string(),
  Deontic: z.string().optional(),
  Aim: z.string(),
  "Direct Object": z.string().optional(),
  "Type Of Direct Object": z.string().optional(),
  "Indirect Object": z.string().optional(),
  "Type Of Indirect Object": z.string().optional(),
  "Activation Condition": z.string().optional(),
  "Execution Constraint": z.string().optional(),
  "Or Else": z.string().optional(),
});
export type Statement = z.infer<typeof statementSchema>;
export const statementColumns = Object.keys(statementSchema.shape);

export const statementsSchema = z.array(statementSchema);
export type Statements = z.infer<typeof statementsSchema>;
