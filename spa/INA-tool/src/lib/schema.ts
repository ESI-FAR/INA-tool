import { z } from "zod";

export const statementSchema = z.object({
  Id: z.string().optional(),
  "Statement Type": z.string(),
  Attribute: z.string(),
  Deontic: z.string().optional(),
  Aim: z.string(),
  "Direct Object": z.string().optional(),
  "Type of Direct Object": z.string().optional(),
  "Indirect Object": z.string().optional(),
  "Type of Indirect Object": z.string().optional(),
  "Activation Condition": z.string().optional(),
  "Execution Constraint": z.string().optional(),
  "Or Else": z.string().optional(),
});
export type Statement = z.infer<typeof statementSchema>;
export const statementColumns = Object.keys(
  statementSchema.shape,
) as ReadonlyArray<keyof Statement>;

export const statementsSchema = z.array(statementSchema);
export type Statements = z.infer<typeof statementsSchema>;

export const connectionSchema = z.object({
  source_statement: z.string(),
  source_node: z.union([
    z.literal("direct-object"),
    z.literal("indirect-object"),
    z.literal("aim"),
  ]),
  target_statement: z.string(),
  target_node: z.union([
    z.literal("attribute"),
    z.literal("activation-condition"),
  ]),
  driver: z.union([
    z.literal("actor"),
    z.literal("outcome"),
    z.literal("sanction"),
  ]),
});
export type Connection = z.infer<typeof connectionSchema>;
export const connectionColumns = Object.keys(
  connectionSchema.shape,
) as ReadonlyArray<keyof Connection>;
