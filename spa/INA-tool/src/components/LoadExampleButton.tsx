import { Statement } from "@/lib/schema";
import { Button } from "./ui/button";
import { load } from "@/lib/io";
import { Wand2Icon } from "lucide-react";

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

function loadExample() {
  load(statements, []);
}

export function LoadExampleButton() {
  return (
    <Button title="Load Example" variant="outline" onClick={loadExample}>
      <Wand2Icon /> Load Example
    </Button>
  );
}
