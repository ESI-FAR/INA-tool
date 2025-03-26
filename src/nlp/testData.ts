import { Statement } from "@/lib/schema";

export const mockStatements: Statement[] = [
    {
        Id: "1",
        "Statement Type": "formal",
        Attribute: "insurers",
        Deontic: "must",
        Aim: "pay",
        "Direct Object": "Property owner",
        "Type of Direct Object": "animate",
        "Indirect Object": "",
        "Type of Indirect Object": "",
        "Activation Condition": "if named storm and damage",
        "Execution Constraint": "",
        "Or Else": "",
    },
    {
        Id: "2",
        "Statement Type": "informal",
        Attribute: "Property owner",
        Deontic: "may",
        Aim: "sue",
        "Direct Object": "insurers",
        "Type of Direct Object": "animate",
        "Indirect Object": "",
        "Type of Indirect Object": "",
        "Activation Condition": "if named storm and damage and not payed out",
        "Execution Constraint": "",
        "Or Else": "",
    },
    {
        Id: "6",
        "Statement Type": "formal",
        Attribute: "ACER",
        Deontic: "must",
        Aim: "file",
        "Direct Object": "for bankruptcy",
        "Type of Direct Object": "inanimate",
        "Indirect Object": "",
        "Type of Indirect Object": "",
        "Activation Condition": "if funding in the next round ceases",
        "Execution Constraint": "",
        "Or Else": "",
    },  
    {
        Id: "7",
        "Statement Type": "formal",
        Attribute: "Emergency Response Team",
        Deontic: "must",
        Aim: "coordinate",
        "Direct Object": "evacuation efforts",
        "Type of Direct Object": "animate",
        "Indirect Object": "",
        "Type of Indirect Object": "",
        "Activation Condition": "",
        "Execution Constraint": "",
        "Or Else": "",
    },
    {
        Id: "8",
        "Statement Type": "formal",
        Attribute: "Local residents",
        Deontic: "may",
        Aim: "coordinate",
        "Direct Object": "community relief efforts",
        "Type of Direct Object": "inanimate",
        "Indirect Object": "",
        "Type of Indirect Object": "",
        "Activation Condition": "if Emergency Response Team coordinate evacuation",
        "Execution Constraint": "",
        "Or Else": "",
    },
    {
        Id: "10",
        "Statement Type": "formal",
        Attribute: "Ministry of Health",
        Deontic: "must",
        Aim: "provide",
        "Direct Object": "medical supplies",
        "Type of Direct Object": "inanimate",
        "Indirect Object": "to affected areas",
        "Type of Indirect Object": "animate",
        "Activation Condition": "",
        "Execution Constraint": "with assistance from Red Cross",
        "Or Else": "",
    },
    {
        Id: "11",
        "Statement Type": "informal",
        Attribute: "Red Cross",
        Deontic: "should",
        Aim: "provide",
        "Direct Object": "emergency services assistance",
        "Type of Direct Object": "inanimate",
        "Indirect Object": "to affected areas",
        "Type of Indirect Object": "",
        "Activation Condition": "when requested",
        "Execution Constraint": "",
        "Or Else": "or risk funding cuts",
    },
    {
        Id: "13",
        "Statement Type": "formal",
        Attribute: "Meteorological Department",
        Deontic: "must",
        Aim: "issue",
        "Direct Object": "storm warnings",
        "Type of Direct Object": "inanimate",
        "Indirect Object": "",
        "Type of Indirect Object": "",
        "Activation Condition": "",
        "Execution Constraint": "",
        "Or Else": "",
    },
    {
        Id: "14",
        "Statement Type": "formal",
        Attribute: "Public",
        Deontic: "must",
        Aim: "evacuate",
        "Direct Object": "coastal areas",
        "Type of Direct Object": "inanimate",
        "Indirect Object": "",
        "Type of Indirect Object": "",
        "Activation Condition": "if Meteorological Department issue storm warnings",
        "Execution Constraint": "",
        "Or Else": "",
    },
    {
        Id: "16",
        "Statement Type": "formal",
        Attribute: "Building Inspectors",
        Deontic: "must",
        Aim: "assess",
        "Direct Object": "structural damage",
        "Type of Direct Object": "inanimate",
        "Indirect Object": "",
        "Type of Indirect Object": "",
        "Activation Condition": "",
        "Execution Constraint": "within 48 hours after storm",
        "Or Else": "",
    },
    {
        Id: "17",
        "Statement Type": "formal",
        Attribute: "Insurance Companies",
        Deontic: "must",
        Aim: "process",
        "Direct Object": "claims",
        "Type of Direct Object": "inanimate",
        "Indirect Object": "",
        "Type of Indirect Object": "",
        "Activation Condition": "after Building Inspectors assess within 48 hours after storm",
        "Execution Constraint": "",
        "Or Else": "",
    },
] as const;

export const statements: Statement[] = [
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
