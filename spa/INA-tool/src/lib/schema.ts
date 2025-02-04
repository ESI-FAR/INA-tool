import { z } from "zod";

export const StatementType = z.enum(["", "formal", "informal"]);

export const TypeOfObject = z.enum(["", "animate", "inanimate"]);

export const statementSchema = z.object({
  Id: z.string().optional(),
  "Statement Type": StatementType,
  Attribute: z.string().min(1),
  // TODO make Deontic union of 'must' and '' and ...?
  Deontic: z.string().optional(),
  Aim: z.string().min(1),
  "Direct Object": z.string().optional(),
  "Type of Direct Object": TypeOfObject.optional(),
  "Indirect Object": z.string().optional(),
  "Type of Indirect Object": TypeOfObject.optional(),
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

export const SourceNodeType = z.enum([
  "direct-object",
  "indirect-object",
  "aim",
  "execution-constraint",
]);

export const TargetNodeType = z.enum(["attribute", "activation-condition"]);

export const DriverType = z.enum(["actor", "outcome", "sanction"]);

export const connectionSchema = z.object({
  source_statement: z.string(),
  source_node: SourceNodeType,
  source_value: z.string().optional(),
  target_statement: z.string(),
  target_node: TargetNodeType,
  target_value: z.string().optional(),
  driver: DriverType,
});
export type Connection = z.infer<typeof connectionSchema>;
export const connectionColumns = Object.keys(
  connectionSchema.shape,
) as ReadonlyArray<keyof Connection>;

export const connectionsSchema = z.array(connectionSchema);
