import { z } from "zod";

export const StatementType = z.enum(["formal", "informal"]);
export type StatementType = z.infer<typeof StatementType>;

export const TypeOfObject = z.enum(["", "animate", "inanimate"]);

export const deonticSchema = z.enum(["must", "may", "must not", "may not", ""]);
export type Deontic = z.infer<typeof deonticSchema>;

const unrefinedStatementSchema = z.object({
  Id: z.coerce.string().optional(),
  "Statement Type": StatementType,
  Attribute: z.string().min(1),
  Deontic: deonticSchema,
  Aim: z.string().min(1),
  "Direct Object": z.string().optional(),
  "Type of Direct Object": TypeOfObject.optional(),
  "Indirect Object": z.string().optional(),
  "Type of Indirect Object": TypeOfObject.optional(),
  "Activation Condition": z.string().optional(),
  "Execution Constraint": z.string().optional(),
  "Or Else": z.string().optional(),
});
export const statementSchema = unrefinedStatementSchema
  .refine(
    (data) =>
      (data["Direct Object"] && data["Type of Direct Object"]) ||
      (!data["Direct Object"] && !data["Type of Direct Object"]),
    {
      message:
        '"Type of Direct Object" must be provided if "Direct Object" is provided',
      path: ["Direct Object", "Type of Direct Object"],
    },
  )
  .refine(
    (data) =>
      (!data["Indirect Object"] && !data["Type of Indirect Object"]) ||
      (data["Indirect Object"] && data["Type of Indirect Object"]),
    {
      message:
        '"Type of Indirect Object" must be provided if "Indirect Object" is provided',
      path: ["Indirect Object", "Type of Indirect Object"],
    },
  )
  .refine(
    (data) =>
      (data["Indirect Object"] && data["Direct Object"]) ||
      !data["Indirect Object"],
    {
      message:
        '"Direct Object" must be provided if "Indirect Object" is provided',
      path: ["Direct Object"],
    },
  );
export type Statement = z.infer<typeof statementSchema>;
export const statementColumns = Object.keys(
  unrefinedStatementSchema.shape,
) as ReadonlyArray<keyof Statement>;

export const statementsSchema = z.array(statementSchema);
export type Statements = z.infer<typeof statementsSchema>;

export const SourceComponentSchema = z.enum([
  "direct-object",
  "indirect-object",
  "aim",
  "execution-constraint",
]);

export const TargetComponentSchema = z.enum([
  "attribute",
  "activation-condition",
]);
export type ConnectionComponent =
  | z.infer<typeof SourceComponentSchema>
  | z.infer<typeof TargetComponentSchema>;

export const DriverType = z.enum(["actor", "outcome", "sanction"]);

const connectionUnrefinedSchema = z.object({
  source_statement: z.string(),
  source_component: SourceComponentSchema,
  target_statement: z.string(),
  target_component: TargetComponentSchema,
  driver: DriverType,
});
export const connectionSchema = connectionUnrefinedSchema
  .refine((data) => data.source_statement !== data.target_statement, {
    message: "source_statement and target_statement must be different",
    path: ["source_statement", "target_statement"],
  })
  .refine(
    (data) =>
      (data.driver === "sanction" &&
        data.source_component === "aim" &&
        data.target_component === "activation-condition") ||
      data.driver !== "sanction",
    {
      message:
        'Sanction-driven connection must have source_component as "aim" and target_component as "activation-condition"',
      path: ["driver"],
    },
  )
  .refine(
    (data) =>
      // Cannot check that source_statement object is animate, so that is part of add connection logic
      (data.driver === "actor" &&
        (data.source_component === "execution-constraint" ||
          data.source_component === "direct-object" ||
          data.source_component === "indirect-object") &&
        data.target_component === "attribute") ||
      data.driver !== "actor",
    {
      message:
        'Actor-driven connection must have source_component as "execution-constraint", "direct-object" or "indirect-object" and target_component as "attribute"',
      path: ["driver"],
    },
  )
  .refine(
    (data) =>
      // Cannot check that source_statement object is imanimate, so that is part of add connection logic
      ((data.source_component === "direct-object" ||
        data.source_component === "indirect-object") &&
        data.target_component === "activation-condition") ||
      data.driver !== "outcome",
    {
      message:
        'Outcome-driven connection must have source_component as "direct-object" or "indirect-object" and target_component as "activation-condition"',
      path: ["driver"],
    },
  );
export type Connection = z.infer<typeof connectionSchema>;
export type ConnectionWithValues = Connection & {
  source_value: string;
  target_value: string;
};
export const connectionColumns = Object.keys(
  connectionUnrefinedSchema.shape,
) as ReadonlyArray<keyof Connection>;

export const connectionsSchema = z.array(connectionSchema);

export const Conflict = z.object({
  formal: statementSchema,
  informal: statementSchema,
});
export type Conflict = z.infer<typeof Conflict>;
export const Conflicts = z.array(Conflict);
export type Conflicts = z.infer<typeof Conflicts>;
