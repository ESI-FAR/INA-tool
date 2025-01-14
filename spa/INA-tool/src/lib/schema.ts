import { z } from "zod";

/*
    "Id",
    "Statement Type",
    "Attribute",
    "Deontic",
    "Aim",
    "Direct Object",
    "Type Of Direct Object",
    "Indirect Object",
    "Type Of Indirect Object",
    "Activation Condition",
    "Execution Constraint",
    "Or Else",
*/
const statementSchema = z.object({
  id: z.string(),
  statementType: z.string(),
  attribute: z.string(),
  deontic: z.string(),
  aim: z.string(),
  directObject: z.string(),
  typeOfDirectObject: z.string(),
  indirectObject: z.string(),
  typeOfIndirectObject: z.string(),
  activationCondition: z.string(),
  executionConstraint: z.string(),
  orElse: z.string(),
});
export type Statement = z.infer<typeof statementSchema>;

export const statementsSchema = z.array(statementSchema);
export type Statements = z.infer<typeof statementsSchema>;
