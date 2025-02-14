import { Check, ChevronsUpDown, PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Connection, Statement } from "@/lib/schema";
import { useCallback, useMemo, useState } from "react";
import { useConnections } from "@/hooks/use-connections";
import { statementPair2PossibleConnections } from "@/lib/possibleConnections";
import { connection2id } from "@/lib/connection2id";
import { textColor } from "./drivenColors";
import { useStatements } from "@/hooks/use-statements";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { Hit, searchStatement } from "./search";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { DialogDescription } from "@radix-ui/react-dialog";

function searchStatements(query: string, statements: Statement[]) {
  if (query === "") {
    return statements;
  }
  return statements.filter((statement) => searchStatement(query, statement));
}

function StatementComboBox({
  statements,
  value,
  onChange,
}: {
  statements: Statement[];
  value: Statement | undefined;
  onChange: (statement: Statement) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const hits = useMemo(
    () => searchStatements(query, statements),
    [query, statements],
  );
  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open}>
          {value ? (
            <Hit className="w-fit" statement={value} query="" />
          ) : (
            "Select statement"
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search statement..."
            className="h-9"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No statements found.</CommandEmpty>
            <CommandGroup>
              {hits.map((statement) => (
                <CommandItem
                  key={statement.Id!}
                  value={statement.Id!}
                  onSelect={(currentValue) => {
                    const selectedStatement = statements.find(
                      (statement) => statement.Id === currentValue,
                    )!;
                    onChange(selectedStatement);
                    setOpen(false);
                  }}
                >
                  <Hit statement={statement} query={query} />
                  <Check
                    className={cn(
                      "ml-auto",
                      value?.Id === statement.Id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function SourceStatementField({
  value,
  onSelect,
}: {
  value: Statement | undefined;
  onSelect: (statement: Statement) => void;
}) {
  const { statements } = useStatements();
  // TODO: filter out statements that already connections or can't be source for selected target
  return (
    <StatementComboBox
      statements={statements}
      value={value}
      onChange={onSelect}
    />
  );
}

function TargetStatementField({
  value,
  onSelect,
}: {
  value: Statement | undefined;
  onSelect: (statement: Statement) => void;
}) {
  // TODO: filter out statements that already connections or can't be source for selected target
  const { statements } = useStatements();
  return (
    <StatementComboBox
      statements={statements}
      value={value}
      onChange={onSelect}
    />
  );
}

function ConnectionPicker({
  source,
  target,
  onPick,
}: {
  source: Statement;
  target: Statement;
  onPick: (connection: Connection) => void;
}) {
  const { connections } = useConnections();
  const choices = useMemo(() => {
    const existingConnectionIds = new Set(connections.map(connection2id));
    const possibleConnections = statementPair2PossibleConnections(
      source,
      target,
    );
    // Filter out existing connections
    return possibleConnections.filter(
      (c) => !existingConnectionIds.has(connection2id(c)),
    );
  }, [connections, source, target]);

  if (choices.length === 0) {
    return (
      <span className="p-2 text-gray-500">
        No possible connections. Please select other statements.
      </span>
    );
  }
  return (
    <div className="flex flex-col items-start gap-1">
      {choices.map((c) => (
        <Button
          className=""
          key={connection2id(c)}
          variant="secondary"
          onClick={(e) => {
            e.preventDefault();
            onPick(c);
          }}
        >
          <div>
            {c.source_component}:{c.source_value}
          </div>
          <div className={textColor[c.driven_by]}>➜{c.driven_by}➜</div>
          <div>
            {c.target_component}:{c.target_value}
          </div>
        </Button>
      ))}
    </div>
  );
}

export function AddConnectionButton() {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<Statement | undefined>(undefined);
  const [target, setTarget] = useState<Statement | undefined>(undefined);
  const { addConnection } = useConnections();

  const onPick = useCallback(
    (connection: Connection) => {
      addConnection(connection);
      setSource(undefined);
      setTarget(undefined);
      setOpen(false);
    },
    [addConnection],
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <PlusIcon />
          Add connection
        </Button>
      </DialogTrigger>
      <DialogContent className="w-fit max-w-fit">
        <DialogHeader>
          <DialogTitle>Add connection</DialogTitle>
          <DialogDescription>
            First source and target statements then pick a connection.
          </DialogDescription>
        </DialogHeader>

        <fieldset className="border p-1">
          <legend>Source</legend>
          <SourceStatementField value={source} onSelect={setSource} />
        </fieldset>
        <fieldset className="border p-1">
          <legend>Target</legend>
          <TargetStatementField value={target} onSelect={setTarget} />
        </fieldset>
        <fieldset className="border p-1">
          <legend>Possible connections</legend>
          {source && target ? (
            <ConnectionPicker source={source} target={target} onPick={onPick} />
          ) : (
            <span className="p-2 text-gray-500">
              Select source and target statements to see possible connections
            </span>
          )}
        </fieldset>
      </DialogContent>
    </Dialog>
  );
}
