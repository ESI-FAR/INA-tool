import { Statement, Connection } from "@/lib/schema";

// Mitigation budgeting network
export const statements: Statement[] = [
  {
    Id: "1",
    "Statement Type": "formal",
    Attribute: "VROMI minister",
    Deontic: "must",
    Aim: "request",
    "Direct Object": "finance minister to approve budget",
    "Type of Direct Object": "animate",
    "Indirect Object": "",
    "Type of Indirect Object": "",
    "Activation Condition": "if budget has changed from last year",
    "Execution Constraint": "every year",
    "Or Else": "",
  },
  {
    Id: "2",
    "Statement Type": "formal",
    Attribute: "Finance minister",
    Deontic: "may",
    Aim: "grant",
    "Direct Object": "last year's budget",
    "Type of Direct Object": "inanimate",
    "Indirect Object": "VROMI minister",
    "Type of Indirect Object": "animate",
    "Activation Condition": "If no new budget requested",
    "Execution Constraint": "",
    "Or Else": "",
  },
  {
    Id: "3",
    "Statement Type": "formal",
    Attribute: "Finance minister",
    Deontic: "must",
    Aim: "request",
    "Direct Object": "CFT (financial authority) to approve budget",
    "Type of Direct Object": "animate",
    "Indirect Object": "",
    "Type of Indirect Object": "",
    "Activation Condition": "if requested by VROMI minister",
    "Execution Constraint": "every year",
    "Or Else": "",
  },
  {
    Id: "4",
    "Statement Type": "formal",
    Attribute: "CFT (financial authority)",
    Deontic: "may",
    Aim: "grant",
    "Direct Object": "last year's budget",
    "Type of Direct Object": "inanimate",
    "Indirect Object": "VROMI minister",
    "Type of Indirect Object": "animate",
    "Activation Condition": "If no new budget requested",
    "Execution Constraint": "",
    "Or Else": "",
  },
  {
    Id: "5",
    "Statement Type": "formal",
    Attribute: "CFT",
    Deontic: "must",
    Aim: "request",
    "Direct Object": "Parliament for budget approval",
    "Type of Direct Object": "animate",
    "Indirect Object": "",
    "Type of Indirect Object": "",
    "Activation Condition": "if requested by Finance minister",
    "Execution Constraint": "",
    "Or Else": "",
  },
  {
    Id: "6",
    "Statement Type": "formal",
    Attribute: "Parliament",
    Deontic: "may",
    Aim: "grant",
    "Direct Object": "last year's budget",
    "Type of Direct Object": "inanimate",
    "Indirect Object": "VROMI minister",
    "Type of Indirect Object": "animate",
    "Activation Condition": "If no new budget requested",
    "Execution Constraint": "",
    "Or Else": "",
  },
  {
    Id: "7",
    "Statement Type": "formal",
    Attribute: "Parliament",
    Deontic: "may",
    Aim: "confirm",
    "Direct Object": "budget request",
    "Type of Direct Object": "inanimate",
    "Indirect Object": "",
    "Type of Indirect Object": "",
    "Activation Condition": "if requested by CFT",
    "Execution Constraint": "",
    "Or Else": "",
  },
  {
    Id: "8",
    "Statement Type": "formal",
    Attribute: "Parliament",
    Deontic: "may",
    Aim: "grant",
    "Direct Object": "last year's budget",
    "Type of Direct Object": "inanimate",
    "Indirect Object": "VROMI minister",
    "Type of Indirect Object": "animate",
    "Activation Condition": "if new budget not confirmed",
    "Execution Constraint": "",
    "Or Else": "",
  },
  {
    Id: "9",
    "Statement Type": "formal",
    Attribute: "VROMI",
    Deontic: "must",
    Aim: "approve",
    "Direct Object": "projects",
    "Type of Direct Object": "inanimate",
    "Indirect Object": "",
    "Type of Indirect Object": "",
    "Activation Condition": "if project costs exceed 5,000 ANG",
    "Execution Constraint": "",
    "Or Else": "",
  },
  {
    Id: "10",
    "Statement Type": "informal",
    Attribute: "VROMI minister",
    Deontic: "",
    Aim: "increases",
    "Direct Object": "budget",
    "Type of Direct Object": "inanimate",
    "Indirect Object": "",
    "Type of Indirect Object": "",
    "Activation Condition":
      "election year [AND] flood in present year [AND] casualty due to flood",
    "Execution Constraint": "",
    "Or Else": "",
  },
  {
    Id: "11",
    "Statement Type": "informal",
    Attribute: "VROMI minister",
    Deontic: "",
    Aim: "reserves",
    "Direct Object": "1/4-1/2 mln ANG for disaster budget",
    "Type of Direct Object": "inanimate",
    "Indirect Object": "",
    "Type of Indirect Object": "",
    "Activation Condition": "every year",
    "Execution Constraint": "",
    "Or Else": "",
  },
  {
    Id: "12",
    "Statement Type": "informal",
    Attribute: "VROMI new projects dept.",
    Deontic: "",
    Aim: "suggests",
    "Direct Object": "joint project with French side",
    "Type of Direct Object": "inanimate",
    "Indirect Object": "",
    "Type of Indirect Object": "",
    "Activation Condition": "every year",
    "Execution Constraint": "",
    "Or Else": "",
  },
  {
    Id: "13",
    "Statement Type": "informal",
    Attribute: "French side",
    Deontic: "may",
    Aim: "request",
    "Direct Object": "funding for infrastructure projects",
    "Type of Direct Object": "inanimate",
    "Indirect Object": "EU",
    "Type of Indirect Object": "animate",
    "Activation Condition": "if requested by VROMI new projects dept.",
    "Execution Constraint": "",
    "Or Else": "",
  },
  {
    Id: "14",
    "Statement Type": "informal",
    Attribute: "EU",
    Deontic: "may",
    Aim: "honor",
    "Direct Object": "project fund request",
    "Type of Direct Object": "inanimate",
    "Indirect Object": "",
    "Type of Indirect Object": "",
    "Activation Condition": "if requested by the French side",
    "Execution Constraint": "",
    "Or Else": "",
  },
] as const;

export const actorConnections: Connection[] = [
  {
    source_statement: "1",
    source_component: "Direct Object",
    target_statement: "3",
    target_component: "Attribute",
    driven_by: "actor",
  },
  {
    source_statement: "3",
    source_component: "Direct Object",
    target_statement: "5",
    target_component: "Attribute",
    driven_by: "actor",
  },
  {
    source_statement: "5",
    source_component: "Direct Object",
    target_statement: "7",
    target_component: "Attribute",
    driven_by: "actor",
  },
  {
    source_statement: "13",
    source_component: "Indirect Object",
    target_statement: "14",
    target_component: "Attribute",
    driven_by: "actor",
  },

  // extra connections identified by NLP (that humans don't):
  {
    driven_by: "actor",
    source_component: "Direct Object",
    source_statement: "1",
    target_component: "Attribute",
    target_statement: "5",
  },
  {
    driven_by: "actor",
    source_component: "Direct Object",
    source_statement: "1",
    target_component: "Attribute",
    target_statement: "13",
  },
] as const;

export const outcomeConnections: Connection[] = [
  {
    source_statement: "10",
    source_component: "Direct Object",
    target_statement: "1",
    target_component: "Activation Condition",
    driven_by: "outcome",
  },

  // extra connections identified by humans (that NLP doesn't agree with):
  // {
  //   source_statement: "12",
  //   source_component: "Direct Object",
  //   target_statement: "14",
  //   target_component: "Activation Condition",
  //   driven_by: "outcome",
  // },
] as const;
