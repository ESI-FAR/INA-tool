import { Conflict, Statement } from "@/lib/schema";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { PencilIcon, PlusIcon } from "lucide-react";
import { useConflicts } from "@/hooks/use-conflicts";
import { useStatements } from "@/hooks/use-statements";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { filterStatements, Hit } from "./search";

export function AddConflictButton() {
  const { addConflict } = useConflicts();
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState("");
  const [query, setQuery] = useState("");
  const { statements } = useStatements();
  const [selectedStatements, setSelectedStatements] = useState<Statement[]>([]);
  const availableStatements = useMemo(() => {
    const selectedIds = new Set(selectedStatements.map((s) => s.Id));
    const eligibleStatements = statements.filter(
      (statement) => !selectedIds.has(statement.Id),
    );
    return filterStatements(query, eligibleStatements);
  }, [query, selectedStatements, statements]);
  const onPick = useCallback(() => {
    addConflict({
      group,
      statements: new Set(selectedStatements.map((s) => s.Id)),
    });
    setOpen(false);
  }, [addConflict, group, selectedStatements]);
  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setGroup("");
        setSelectedStatements([]);
        setQuery("");
        setOpen(!open);
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
            Give conflict a group name and select its statements.
          </DialogDescription>
        </DialogHeader>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="group">Group</Label>
          <Input
            type="group"
            id="group"
            required
            value={group}
            onChange={(e) => setGroup(e.currentTarget.value)}
          />
        </div>
        <div className="flex flex-row justify-between gap-2">
          <fieldset className="border p-1">
            <legend>Available</legend>
            <Input
              type="search"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
            />
            <ol>
              {availableStatements.map((statement) => (
                <li key={statement.Id} className="flex flex-row gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() =>
                      setSelectedStatements([...selectedStatements, statement])
                    }
                  >
                    +
                  </Button>
                  <Hit statement={statement} query={query} />
                </li>
              ))}
            </ol>
          </fieldset>
          <fieldset className="border p-1">
            <legend>Selected</legend>
            <ol>
              {selectedStatements.map((statement) => (
                <li key={statement.Id} className="flex flex-row gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() =>
                      setSelectedStatements(
                        selectedStatements.filter((s) => s.Id !== statement.Id),
                      )
                    }
                  >
                    -
                  </Button>
                  <Hit statement={statement} query={query} />
                </li>
              ))}
            </ol>
          </fieldset>
        </div>
        <DialogFooter>
          <Button onClick={onPick}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditConflictButton({
  conflict,
  onSave,
}: {
  conflict: Conflict;
  onSave: (conflict: Conflict) => void;
}) {
  const [group, setGroup] = useState(conflict.group);
  const [query, setQuery] = useState("");
  const { statements } = useStatements();
  const [selectedStatements, setSelectedStatements] = useState<Statement[]>([]);
  useEffect(() => {
    const init = statements.filter((s) => conflict.statements.has(s.Id));
    setSelectedStatements(init);
  }, [conflict, statements]);
  const availableStatements = useMemo(() => {
    const selectedIds = new Set(selectedStatements.map((s) => s.Id));
    const eligibleStatements = statements.filter(
      (statement) => !selectedIds.has(statement.Id),
    );
    return filterStatements(query, eligibleStatements);
  }, [query, selectedStatements, statements]);
  const onPick = useCallback(() => {
    onSave({
      group,
      statements: new Set(selectedStatements.map((s) => s.Id)),
    });
  }, [group, onSave, selectedStatements]);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" title="Edit conflict" size="icon">
          <PencilIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-fit max-w-fit">
        <DialogHeader>
          <DialogTitle>Edit conflict</DialogTitle>
          <DialogDescription>
            Give conflict a group name and select its statements.
          </DialogDescription>
        </DialogHeader>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="group">Group</Label>
          <Input
            type="group"
            id="group"
            required
            value={group}
            onChange={(e) => setGroup(e.currentTarget.value)}
          />
        </div>
        <div className="flex flex-row justify-between gap-2">
          <fieldset className="border p-1">
            <legend>Available</legend>
            <Input
              type="search"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
            />
            <ol>
              {availableStatements.map((statement) => (
                <li key={statement.Id} className="flex flex-row gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() =>
                      setSelectedStatements([...selectedStatements, statement])
                    }
                  >
                    +
                  </Button>
                  <Hit statement={statement} query={query} />
                </li>
              ))}
            </ol>
          </fieldset>
          <fieldset className="border p-1">
            <legend>Selected</legend>
            <ol>
              {selectedStatements.map((statement) => (
                <li key={statement.Id} className="flex flex-row gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() =>
                      setSelectedStatements(
                        selectedStatements.filter((s) => s.Id !== statement.Id),
                      )
                    }
                  >
                    -
                  </Button>
                  <Hit statement={statement} query={query} />
                </li>
              ))}
            </ol>
          </fieldset>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={onPick}>Save</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
