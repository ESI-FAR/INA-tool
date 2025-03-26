import { RefinementCtx, z } from "zod";

export const StatementType = z.enum(["formal", "informal"]);
export type StatementType = z.infer<typeof StatementType>;

export const TypeOfObject = z.enum(["", "animate", "inanimate"]);

export const deonticSchema = z.enum(["must", "may", "must not", "may not", "", "shall", "shall not", "should", "should not", "can", "cannot"]);
export type Deontic = z.infer<typeof deonticSchema>;

const unrefinedStatementSchema = z.object({
  Id: z.string(),
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
const unrefinedStatementSchemaWithOptionalId = unrefinedStatementSchema.extend({
  Id: z.coerce.string().optional(),
});

// TODO make data better typed, but tricky due to 2 slightly different schemas it is used in
const applyStatementLevelValidations = (
  data: Record<string, string>,
  ctx: RefinementCtx,
) => {
  // Direct Object validations
  if (data["Type of Direct Object"] && !data["Direct Object"]) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Must be set when "Type of Direct Object" is set',
      path: ["Direct Object"],
    });
  }
  if (data["Direct Object"] && !data["Type of Direct Object"]) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Must be set when "Direct Object" is set',
      path: ["Type of Direct Object"],
    });
  }
  // Indirect Object validations
  if (data["Type of Indirect Object"] && !data["Indirect Object"]) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Must be set when "Type of Indirect Object" is set',
      path: ["Indirect Object"],
    });
  }
  if (data["Indirect Object"] && !data["Type of Indirect Object"]) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Must be set when "Indirect Object" is set',
      path: ["Type of Indirect Object"],
    });
  }

  // Indirect Object requires Direct Object
  if (data["Indirect Object"] && !data["Direct Object"]) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Must be provided if "Indirect Object" is provided',
      path: ["Direct Object"],
    });
  }
};

export const statementSchema = unrefinedStatementSchema.superRefine(
  applyStatementLevelValidations,
);
const statementSchemaWithOptionalId =
  unrefinedStatementSchemaWithOptionalId.superRefine(
    applyStatementLevelValidations,
  );
export type StatementWithOptionalId = z.infer<
  typeof statementSchemaWithOptionalId
>;
export type Statement = z.infer<typeof statementSchema>;
export const statementColumns = Object.keys(
  unrefinedStatementSchema.shape,
) as Array<keyof Statement>;

export const statementsSchema = z.array(statementSchemaWithOptionalId);
export type StatementsWithOptionalId = z.infer<typeof statementsSchema>;

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
        'Sanction-driven connection must have source_component as "Aim" and target_component as "Activation Condition"',
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
        'Actor-driven connection must have source_component as "Execution Constraint", "Direct Object" or "Indirect Object" and target_component as "Attribute"',
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
        'Outcome-driven connection must have source_component as "Direct Object" or "Indirect Object" and target_component as "Activation Condition"',
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
) as Array<keyof Connection>;

export const connectionsSchema = z.array(connectionSchema);

export const Conflict = z.object({
  formal: z.string(),
  informal: z.string(),
});
export type Conflict = z.infer<typeof Conflict>;
export const conflictColumns = Object.keys(Conflict.shape) as Array<
  keyof Conflict
>;

export const Conflicts = z.array(Conflict);
export type Conflicts = z.infer<typeof Conflicts>;
