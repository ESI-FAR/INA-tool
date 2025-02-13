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
  "Direct Object",
  "Indirect Object",
  "Aim",
  "Execution Constraint",
]);

export const TargetComponentSchema = z.enum([
  "Attribute",
  "Activation Condition",
]);
export type ConnectionComponent =
  | z.infer<typeof SourceComponentSchema>
  | z.infer<typeof TargetComponentSchema>;

export const drivenbySchema = z.enum(["actor", "outcome", "sanction"]);
export type DrivenBy = z.infer<typeof drivenbySchema>;

const connectionUnrefinedSchema = z.object({
  source_statement: z.string().min(1),
  source_component: SourceComponentSchema,
  target_statement: z.string().min(1),
  target_component: TargetComponentSchema,
  driven_by: drivenbySchema,
});
export const connectionSchema = connectionUnrefinedSchema
  .refine((data) => data.source_statement !== data.target_statement, {
    message: "source_statement and target_statement must be different",
    path: ["source_statement", "target_statement"],
  })
  .refine(
    (data) =>
      (data.driven_by === "sanction" &&
        data.source_component === "Aim" &&
        data.target_component === "Activation Condition") ||
      data.driven_by !== "sanction",
    {
      message:
        'Sanction-driven connection must have source_component as "aim" and target_component as "activation-condition"',
      path: ["driven_by"],
    },
  )
  .refine(
    (data) =>
      // Cannot check that source_statement object is animate, so that is part of add connection logic
      (data.driven_by === "actor" &&
        (data.source_component === "Execution Constraint" ||
          data.source_component === "Direct Object" ||
          data.source_component === "Indirect Object") &&
        data.target_component === "Attribute") ||
      data.driven_by !== "actor",
    {
      message:
        'Actor-driven connection must have source_component as "execution-constraint", "direct-object" or "indirect-object" and target_component as "attribute"',
      path: ["driven_by"],
    },
  )
  .refine(
    (data) =>
      // Cannot check that source_statement object is imanimate, so that is part of add connection logic
      ((data.source_component === "Direct Object" ||
        data.source_component === "Indirect Object") &&
        data.target_component === "Activation Condition") ||
      data.driven_by !== "outcome",
    {
      message:
        'Outcome-driven connection must have source_component as "direct-object" or "indirect-object" and target_component as "activation-condition"',
      path: ["driven_by"],
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
