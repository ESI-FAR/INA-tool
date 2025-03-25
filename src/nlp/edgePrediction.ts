import { store } from "@/stores/global";
import { Connection, Statement } from "@/lib/schema";

/** 
 * Connection types and rules for creating them:
 * 
 *  1. Actor-driven connections: the animate object (whether
    direct or indirect) of a statement is connected to the
    attribute of another statement. Making this connection
    is only possible when (the attribute and the aim) or
    (the properties of the objects and the aim) of the first
    statement appear in the activation condition of the
    second statement. An actor-driven connection is also
    possible if the attribute of the second statement appears
    in the execution constraint of the first statement. Note
    that the aims should be exactly the same and not the
    opposite, as this could reflect a discrepancy issue. An
    example of actor-driven connections, colored in purple,
    can be observed in Figure 3a.

    Kody question: "what does "properties of the objects" mean?

    StatementA.animate_object -> StatementB.attribute
        => 
            ((StatementA.attribute and StatementA.aim) or ())
            in (StatementB.activation_condition) 
            and (StatementA.aim == StatementB.aim)

    StatementA.animate_object -> StatementB.attribute
        => 
            (StatementB.attribute in StatementA.execution_constraint) 
            and (StatementA.aim == StatementB.aim)
    
    2. Outcome-driven connections: the inanimate direct
    object of a statement or its execution constraint is
    connected to the activation condition of another
    statement if that object and the aim, or the execution
    constraint and the aim appear in the condition of
    the second statement. The inanimate object of a
    statement appearing as the activation condition of
    another statement implies that the implementation of
    a statement is the trigger for the execution of another
    statement (for example, see the green connection
    in Figure 3b). In other words, this connection reflects
    the fact that one statement can instantiate a discrete
    context that activates a second statement (Frantz &
    Siddiki, 2021),

    Kody question: "(activation) condition, right?"

    StatementA.inanimate_direct_object -> StatementB.activation_condition
        =>
            (StatementA.inanimate_direct_object 
            in StatementB.activation_condition) 
            and (StatementA.aim in StatementB.activation_condition)

    StatementA.execution_constraint -> StatementB.activation_condition
        =>
            (StatementA.execution_constraint 
            in StatementB.activation_condition) 
            and (StatementA.aim in StatementB.activation_condition)

    3. Sanction-driven connections: We assume a nested
    structuring of statements, meaning that the sanction
    of a statement is a statement by itself (Frantz & Siddiki,
    2021). To capture this nested structure, we connect
    the aim of a statement to the activation condition
    of another statement if the opposite of that aim is
    present in the second statement, colored in red in
    Figure 3c.

    "opposite of that aim is present" means "or else"
    and this indicates sanction-driven connection
*/

const statements: Statement[] = [
    {
        Id: "1",
        "Statement Type": "formal",
        Attribute: "VROMI minister",
        Deontic: "must",
        Aim: "order",
        "Direct Object": "infrastructure dept to execute clean-up",
        "Type of Direct Object": "animate",
        "Indirect Object": "",
        "Type of Indirect Object": "",
        "Activation Condition": "if necessary after a storm event",
        "Execution Constraint": "",
        "Or Else": "",
    },
    {
        Id: "2",
        "Statement Type": "informal",
        Attribute: "Governor",
        Deontic: "",
        Aim: "requests",
        "Direct Object": "financial aid",
        "Type of Direct Object": "inanimate",
        "Indirect Object": "from Dutch Kingdom",
        "Type of Indirect Object": "animate",
        "Activation Condition": "if requested by Prime minister",
        "Execution Constraint": "",
        "Or Else": "",
    },
    {
        Id: "3",
        "Statement Type": "formal",
        Attribute: "Property owners",
        Deontic: "must",
        Aim: "insure",
        "Direct Object": "their properties",
        "Type of Direct Object": "inanimate",
        "Indirect Object": "",
        "Type of Indirect Object": "",
        "Activation Condition": "",
        "Execution Constraint": "",
        "Or Else": "",
    },
    {
        Id: "4",
        "Statement Type": "informal",
        Attribute: "NGOs",
        Deontic: "",
        Aim: "help",
        "Direct Object": "",
        "Type of Direct Object": "",
        "Indirect Object": "",
        "Type of Indirect Object": "",
        "Activation Condition": "if requested by inhabitants",
        "Execution Constraint": "in reconstruction",
        "Or Else": "",
    },
    {
        Id: "5",
        "Statement Type": "formal",
        Attribute: "VROMI infrastructure dept.",
        Deontic: "must",
        Aim: "clean",
        "Direct Object": "gutters",
        "Type of Direct Object": "inanimate",
        "Indirect Object": "",
        "Type of Indirect Object": "",
        "Activation Condition": "",
        "Execution Constraint": "before June (start hurricane season)",
        "Or Else": "",
    },
    {
        Id: "6",
        "Statement Type": "formal",
        Attribute: "ACER",
        Deontic: "must",
        Aim: "update",
        "Direct Object": "the recommendations",
        "Type of Direct Object": "inanimate",
        "Indirect Object": "",
        "Type of Indirect Object": "",
        "Activation Condition": "",
        "Execution Constraint": "at least once every two years",
        "Or Else": "",
    },
] as const;

export function findConnections(statements: Statement[]): Connection[] {
    const connections: Connection[] = [];
    const animateObjectsMap = new Map<string, Statement[]>();

    // Step 1: Preprocess animate objects for quick lookup
    for (const statement of statements) {
        const directObject = statement["Direct Object"] ?? "";
        const indirectObject = statement["Indirect Object"] ?? "";

        if (statement["Type of Direct Object"] == "animate") {
            if (!animateObjectsMap.has(directObject)) {
                animateObjectsMap.set(directObject, []);
            }
            animateObjectsMap.get(directObject)!.push(statement);
        }
        if (statement["Type of Indirect Object"] == "animate") {
            if (!animateObjectsMap.has(indirectObject)) {
                animateObjectsMap.set(indirectObject, []);
            }
            animateObjectsMap.get(indirectObject)!.push(statement);
        }
    }

    // Step 2: Iterate over all statement pairs and find valid connections
    for (const source of statements) {
        for (const target of statements) {
            if (source.Id == target.Id) continue;

            const sourceAim = source.Aim ?? "";
            const sourceDirectObject = source["Direct Object"] ?? "";
            const sourceIndirectObject = source["Indirect Object"] ?? "";
            const sourceTypeIndirectObject = source["Type of Indirect Object"] ?? "";
            const targetActivationCondition = target["Activation Condition"] ?? "";
            // const targetExecutionConstraint = target["Execution Constraint"] ?? "";
            const targetAttribute = target.Attribute ?? "";

            // Condition 1: Aim -> Activation Condition (sanction-driven)
            if (targetActivationCondition.includes(sourceAim)) {
                connections.push({
                    source_statement: source.Id,
                    source_component: "Aim",
                    target_statement: target.Id,
                    target_component: "Activation Condition",
                    driven_by: "sanction",
                });
            }

            // Condition 2: Animate Indirect Object -> Attribute (actor-driven)
            if (sourceTypeIndirectObject == "animate" && targetAttribute == sourceIndirectObject) {
                connections.push({
                    source_statement: source.Id,
                    source_component: "Indirect Object",
                    target_statement: target.Id,
                    target_component: "Attribute",
                    driven_by: "actor",
                });
            }

            // Condition 3: Direct Object -> Activation Condition (outcome-driven)
            if (sourceDirectObject && targetActivationCondition.includes(sourceDirectObject)) {
                connections.push({
                    source_statement: source.Id,
                    source_component: "Direct Object",
                    target_statement: target.Id,
                    target_component: "Activation Condition",
                    driven_by: "outcome",
                });
            }
        }
    }

    return connections;
}

const foundConnections = findConnections(statements);
console.log(foundConnections);
store.getState().setConnections(foundConnections);