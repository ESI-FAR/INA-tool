import { Connection, Statement } from "@/lib/schema";
import { Button } from "./ui/button";
import { Wand2Icon } from "lucide-react";
import { store } from "@/stores/global";
import { useEffect } from "react";

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
    // To test source picker uncomment line below, and comment line above
    // "Type of Direct Object": "animate",
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
    // To test text wrapping uncomment line below, and comment line above
    // "Activation Condition":
    //   "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
    "Execution Constraint": "at least once every two years",
    "Or Else": "",
  },
] as const;

const connections: Connection[] = [
  {
    source_statement: "1",
    source_component: "Aim",
    target_statement: "2",
    target_component: "Activation Condition",
    driven_by: "sanction",
  },
  {
    source_statement: "2",
    source_component: "Indirect Object",
    target_statement: "3",
    target_component: "Attribute",
    driven_by: "actor",
  },
  {
    source_statement: "3",
    source_component: "Direct Object",
    target_statement: "4",
    target_component: "Activation Condition",
    driven_by: "outcome",
  },
];

function loadExample() {
  store.getState().setProjectName("Example");
  store.getState().setStatements(statements);
  store.getState().setConnections(connections);
}

export function LoadExampleButton() {
  // Add keyboard shortcut for clearing data
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        loadExample();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Button title="Load Example" variant="outline" onClick={loadExample}>
      <Wand2Icon /> Load Example
    </Button>
  );
}
