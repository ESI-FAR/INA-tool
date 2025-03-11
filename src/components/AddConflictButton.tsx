import { Statement, StatementType } from "@/lib/schema";
import { useCallback, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";
import { useConflicts } from "@/hooks/use-conflicts";
import { useStatements } from "@/hooks/use-statements";
import { StatementComboBox } from "./StatementComboBox";
import { store } from "@/stores/global";

function StatementField({
  selected,
  side,
  other,
  onSelect,
}: {
  selected: Statement | undefined;
  side: StatementType;
  other: Statement | undefined;
  onSelect: (statement: Statement) => void;
}) {
  const { statements: allStatements } = useStatements();
  const statements = useMemo(() => {
    const typeStatements = allStatements.filter(
      (statement) => statement["Statement Type"] === side,
    );
    if (other) {
      // Filter out statements that are already in a conflict with the other side
      const present = store
        .getState()
        .conflicts.filter((c) => {
          if (side === "formal") {
            return c.informal === other.Id;
          } else {
            return c.formal === other.Id;
          }
        })
        .map((c) => {
          if (side === "formal") {
            return c.formal;
          } else {
            return c.informal;
          }
        });
      return typeStatements.filter((statement) => {
        return !present.includes(statement.Id);
      });
    }
    return typeStatements;
  }, [allStatements, side, other]);
  return (
    <>
      <StatementComboBox
        statements={statements}
        value={selected}
        onChange={onSelect}
      />
      {!selected && (
        <div className="text-[0.8rem] font-medium text-destructive">
          Please select a statment
        </div>
      )}
    </>
  );
}

export function AddConflictButton() {
  const { addConflict } = useConflicts();
  const [open, setOpen] = useState(false);
  const [formal, setFormal] = useState<Statement | undefined>(undefined);
  const [informal, setInformal] = useState<Statement | undefined>(undefined);

  const onPick = useCallback(() => {
    if (!formal || !informal) {
      return;
    }
    addConflict({ formal: formal.Id, informal: informal.Id });
    setFormal(undefined);
    setInformal(undefined);
    setOpen(false);
  }, [addConflict, formal, informal]);
  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(!open);
        setFormal(undefined);
        setInformal(undefined);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary">
          <PlusIcon />
          Add conflict
        </Button>
      </DialogTrigger>
      <DialogContent className="w-fit max-w-fit">
        <DialogHeader>
          <DialogTitle>Add conflict</DialogTitle>
          <DialogDescription>
            First select a formal statement and an informal statement then click
            Add.
          </DialogDescription>
        </DialogHeader>

        <fieldset className="border p-1">
          <legend>Formal</legend>
          <StatementField
            selected={formal}
            side="formal"
            other={informal}
            onSelect={setFormal}
          />
        </fieldset>
        <fieldset className="border p-1">
          <legend>Informal</legend>
          <StatementField
            selected={informal}
            side="informal"
            other={formal}
            onSelect={setInformal}
          />
        </fieldset>
        <DialogFooter>
          <Button onClick={onPick}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
