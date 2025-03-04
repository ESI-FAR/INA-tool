import { Statement } from "@/lib/schema";
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

function StatementField({
  selected,
  other,
  onSelect,
}: {
  selected: Statement | undefined;
  other: Statement | undefined;
  onSelect: (statement: Statement) => void;
}) {
  const { statements: allStatements } = useStatements();
  const statements = useMemo(() => {
    if (other) {
      return allStatements.filter((statement) => statement.Id !== other.Id);
    }
    return allStatements;
  }, [allStatements, other]);
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
    addConflict({ formal, informal });
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
            other={informal}
            onSelect={setFormal}
          />
        </fieldset>
        <fieldset className="border p-1">
          <legend>Informal</legend>
          <StatementField
            selected={informal}
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
