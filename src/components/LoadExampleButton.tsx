import { Connection, Statement } from "@/lib/schema";
import { Button } from "./ui/button";
import { ChevronDown, Wand2Icon } from "lucide-react";
import { store } from "@/stores/global";
import { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { statements as statements2 } from "@/nlp/testdata/testData";
import { statements as statements3 } from "@/nlp/testdata/mitigationTestData";
import { statements as statements4 } from "@/nlp/testdata/inspectionsTestData";

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
    "Activation Condition": "if ordered by VROMI",
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
  store.getState().setConflicts([]);
}

function loadExample2() {
  store.getState().setProjectName("Example 2");
  store.getState().setStatements(statements2);
  store.getState().setConnections([]);
  store.getState().setConflicts([]);
}

function loadExample3() {
  store.getState().setProjectName("Example 3");
  store.getState().setStatements(statements3);
  store.getState().setConnections([]);
  store.getState().setConflicts([]);
}

function loadExample4() {
  store.getState().setProjectName("Example 4");
  store.getState().setStatements(statements4);
  store.getState().setConnections([]);
  store.getState().setConflicts([]);
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
    <div className="flex gap-0">
      <Button
        title="Load Example"
        variant="outline"
        onClick={loadExample}
        className="rounded-e-none"
      >
        <Wand2Icon /> Load Example
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="rounded-s-none transition-transform data-[state=open]:rotate-180"
            size="icon"
          >
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={loadExample2}>
            Load example 2
          </DropdownMenuItem>
          <DropdownMenuItem onClick={loadExample3}>
            Load example 3
          </DropdownMenuItem>
          <DropdownMenuItem onClick={loadExample4}>
            Load example 4
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
