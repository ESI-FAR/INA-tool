import { removeKnownConnections } from "@/lib/connectionHelpers";
import { Connection, Statement } from "@/lib/schema";
import {
  fuzzyIncludesOptimized,
  fuzzyMatchOptimized,
} from "@/nlp/fuzzyStringComparison";
import {
  checkWordOccurrence,
  negationIsInWordVicinity,
} from "@/nlp/negationDetection";

/**
 * Defines the rules for Actor-driven connections.
 *
 * - The animate object of a statement is connected to the attribute of another statement.
 * - A connection is valid if:
 *   - Rule 1: `(StatementA.attribute and StatementA.aim)`
 *              or `(properties of the objects and StatementA.aim)`
 *              appear in `StatementB.activation_condition`
 *   - Rule 2: `StatementB.attribute`
 *              appears in `StatementA.execution_constraint`
 *              and `StatementA.aim == StatementB.aim`
 * - Color: purple
 */
async function findActorDrivenConnections(
  source: Statement,
  target: Statement,
): Promise<Connection[]> {
  const connections: Connection[] = [];

  const sourceAttribute = source.Attribute ?? "";
  const sourceAim = source.Aim ?? "";
  const sourceDirectObject = source["Direct Object"] ?? "";
  const sourceDirectObjectType = source["Type of Direct Object"] ?? "";
  const sourceIndirectObject = source["Indirect Object"] ?? "";
  const sourceIndirectObjectType = source["Type of Indirect Object"] ?? "";
  const sourceExecutionConstraint = source["Execution Constraint"] ?? "";

  const targetAttribute = target.Attribute ?? "";
  const targetAim = target.Aim ?? "";
  const targetActivationCondition = target["Activation Condition"] ?? "";

  const hasAnimateDirectObject =
    sourceDirectObjectType === "animate" && sourceDirectObject;
  const hasAnimateIndirectObject =
    sourceIndirectObjectType === "animate" && sourceIndirectObject;

  // If there's no indirect or direct object in the first statement, or if there's no target attribute
  // in second statement, then there can be no connection
  if (
    (!hasAnimateDirectObject && !hasAnimateIndirectObject) ||
    !targetAttribute
  ) {
    return [];
  }

  const sourceComponent = hasAnimateDirectObject
    ? "Direct Object"
    : "Indirect Object";

  try {
    const sourceAttrTargetActComparison = await fuzzyIncludesOptimized(
      sourceAttribute,
      targetActivationCondition,
      1.0,
    );
    const sourceAimTargetActComparison = await fuzzyIncludesOptimized(
      sourceAim,
      targetActivationCondition,
    );

    const rule_one_match =
      sourceAttrTargetActComparison.isMatch &&
      sourceAimTargetActComparison.isMatch &&
      !/\bno\b/.test(targetActivationCondition.toLowerCase()) &&
      !/\bnot\b/.test(targetActivationCondition.toLowerCase());
    if (rule_one_match) {
      connections.push({
        source_statement: source.Id,
        source_component: sourceComponent,
        target_statement: target.Id,
        target_component: "Attribute",
        driven_by: "actor",
        matched_items: [
          {
            source_item: sourceAttrTargetActComparison.matchedItems.source_item,
            target_item: sourceAttrTargetActComparison.matchedItems.target_item,
            source_component: "Attribute",
            target_component: "Activation Condition",
            reverse_connection: false,
          },
          {
            source_item: sourceAimTargetActComparison.matchedItems.source_item,
            target_item: sourceAimTargetActComparison.matchedItems.target_item,
            source_component: "Aim",
            target_component: "Activation Condition",
            reverse_connection: false,
          },
        ],
      });
    } else {
      const targetAttrSourceExecComparison = await fuzzyIncludesOptimized(
        targetAttribute,
        sourceExecutionConstraint,
        1.0,
      );
      const rule_two_match =
        targetAttrSourceExecComparison.isMatch &&
        fuzzyMatchOptimized(sourceAim, targetAim);
      if (rule_two_match) {
        connections.push({
          source_statement: source.Id,
          source_component: sourceComponent,
          target_statement: target.Id,
          target_component: "Attribute",
          driven_by: "actor",
          matched_items: [
            {
              source_item:
                targetAttrSourceExecComparison.matchedItems.source_item,
              target_item:
                targetAttrSourceExecComparison.matchedItems.target_item,
              source_component: "Attribute",
              target_component: "Execution Constraint",
              reverse_connection: true,
            },
            {
              source_item: sourceAim,
              target_item: targetAim,
              source_component: "Aim",
              target_component: "Aim",
              reverse_connection: false,
            },
          ],
        });
      }
    }
  } catch (error) {
    console.error("Error during matching:", error);
  }

  return connections;
}

/**
 * Defines the rules for Outcome-driven connections.
 *
 * - The inanimate direct object of a statement or its execution constraint is connected
 *   to the activation condition of another statement.
 * - A connection is valid if:
 *      - Rule 1: StatementA.direct_object and StatementA.aim
 *                appears in StatementB.activation_condition
 *      - Rule 2: StatementA.execution_constraint and StatementA.aim
 *                appears in StatementB.activation_condition
 * - Color: green
 */
async function findOutcomeDrivenConnections(
  source: Statement,
  target: Statement,
): Promise<Connection[]> {
  const connections: Connection[] = [];

  const sourceAim = source.Aim ?? "";
  const sourceDirectObject = source["Direct Object"] ?? "";
  const sourceDirectObjectType = source["Type of Direct Object"] ?? "";
  const sourceExecutionConstraint = source["Execution Constraint"] ?? "";
  const targetActivationCondition = target["Activation Condition"] ?? "";

  try {
    const directObjTargetActivationComparison = await fuzzyIncludesOptimized(
      sourceDirectObject,
      targetActivationCondition,
    );

    const sourceAimTargetActivationComparison = await fuzzyIncludesOptimized(
      sourceAim,
      targetActivationCondition,
    );

    const targetActivationConditionTokens =
      targetActivationCondition.split(/\s+/);
    const sourceDirectObjectTokens = sourceDirectObject.split(/\s+/);
    const sourceAimTokens = sourceAim.split(/\s+/);
    let negationInVicinity = false;

    for (const t of sourceDirectObjectTokens) {
      const res = negationIsInWordVicinity(
        targetActivationConditionTokens,
        t,
        3,
      );
      if (res === true) {
        negationInVicinity = true;
        break;
      }
    }

    for (const t of sourceAimTokens) {
      const res = negationIsInWordVicinity(
        targetActivationConditionTokens,
        t,
        3,
      );
      if (res === true) {
        negationInVicinity = true;
        break;
      }
    }

    const rule_one_match =
      sourceDirectObjectType == "inanimate" &&
      sourceDirectObject &&
      directObjTargetActivationComparison.isMatch &&
      sourceAimTargetActivationComparison.isMatch &&
      negationInVicinity === false;
    if (rule_one_match) {
      connections.push({
        source_statement: source.Id,
        source_component: "Direct Object",
        target_statement: target.Id,
        target_component: "Activation Condition",
        driven_by: "outcome",
        matched_items: [
          {
            source_item:
              directObjTargetActivationComparison.matchedItems.source_item,
            target_item:
              directObjTargetActivationComparison.matchedItems.target_item,
            source_component: "Direct Object",
            target_component: "Activation Condition",
            reverse_connection: false,
          },
          {
            source_item: sourceAim,
            target_item:
              sourceAimTargetActivationComparison.matchedItems.target_item,
            source_component: "Aim",
            target_component: "Activation Condition",
            reverse_connection: false,
          },
        ],
      });
    } else {
      const sourceExecTargetActivationComparison = await fuzzyIncludesOptimized(
        sourceExecutionConstraint,
        targetActivationCondition,
      );

      const rule_two_match =
        sourceExecutionConstraint &&
        sourceExecTargetActivationComparison.isMatch &&
        sourceAimTargetActivationComparison.isMatch;

      if (rule_two_match) {
        connections.push({
          source_statement: source.Id,
          source_component: "Execution Constraint",
          target_statement: target.Id,
          target_component: "Activation Condition",
          driven_by: "outcome",
          matched_items: [
            {
              source_item:
                sourceExecTargetActivationComparison.matchedItems.source_item,
              target_item:
                sourceExecTargetActivationComparison.matchedItems.target_item,
              source_component: "Execution Constraint",
              target_component: "Activation Condition",
              reverse_connection: false,
            },
            {
              source_item: sourceAim,
              target_item:
                sourceAimTargetActivationComparison.matchedItems.target_item,
              source_component: "Aim",
              target_component: "Activation Condition",
              reverse_connection: false,
            },
          ],
        });
      }
    }
  } catch (error) {
    console.error("error during matching", error);
  }

  return connections;
}

/**
 * Defines the rules for Sanction-driven connections.
 *
 * - Assumes a nested structuring of statements where the sanction of a statement
 *   is itself a statement (Frantz & Siddiki, 2021).
 * - The aim of `StatementA` connects to the activation condition of `StatementB`
 *   if the **opposite** of that aim is present in `StatementB`.
 * - Color: red
 *
 * **Clarification:**
 * "Opposite of that aim is present" means `"or else"`, indicating a sanction-driven connection.
 */
async function findSanctionDrivenConnections(
  source: Statement,
  target: Statement,
): Promise<Connection[]> {
  const connections: Connection[] = [];

  const sourceAim = source.Aim ?? "";
  const aimBase = sourceAim.replace(/s$/, ""); // Remove trailing 's' if present

  const targetActivationCondition = target["Activation Condition"] ?? "";

  try {
    const rule = await checkWordOccurrence(
      aimBase,
      true,
      targetActivationCondition,
    );
    if (rule) {
      connections.push({
        source_statement: source.Id,
        source_component: "Aim",
        target_statement: target.Id,
        target_component: "Activation Condition",
        driven_by: "sanction",
      });
    }
  } catch (error) {
    console.error("error finding sanction connection", error);
  }

  return connections;
}

// Finds connections by given connection type (action, outcome or sanction)
export async function findConnectionsByType(
  statements: Statement[],
  connectionType = "action",
): Promise<Connection[]> {
  const connections: Connection[] = [];

  for (const source of statements) {
    for (const target of statements) {
      if (source.Id === target.Id) continue; // don't compare the same rule to itself

      if (connectionType == "action") {
        const actorDrivenConnections = await findActorDrivenConnections(
          source,
          target,
        );

        connections.push(...actorDrivenConnections);
      } else if (connectionType == "outcome") {
        const outcomeDrivenConnections = await findOutcomeDrivenConnections(
          source,
          target,
        );

        connections.push(...outcomeDrivenConnections);
      } else {
        const sanctionDrivenConnections = await findSanctionDrivenConnections(
          source,
          target,
        );

        connections.push(...sanctionDrivenConnections);
      }
    }
  }

  return connections;
}
// Find all types of connections
export async function findConnections({
  statements,
  connections: existingConnections,
}: {
  statements: Statement[];
  connections: Connection[];
}): Promise<Connection[]> {
  const newConnections: Connection[] = [];

  for (const source of statements) {
    for (const target of statements) {
      if (source.Id === target.Id) continue; // don't compare the same rule to itself

      const actorDrivenConnections = await findActorDrivenConnections(
        source,
        target,
      );
      const outcomeDrivenConnections = await findOutcomeDrivenConnections(
        source,
        target,
      );

      newConnections.push(...actorDrivenConnections);
      newConnections.push(...outcomeDrivenConnections);
    }
  }
  return removeKnownConnections(newConnections, existingConnections);
}
