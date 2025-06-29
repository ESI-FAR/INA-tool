import { PlusIcon } from "lucide-react";
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
import { connection2id } from "@/lib/connectionHelpers";
import { textColor } from "./drivenColors";
import { useStatements } from "@/hooks/use-statements";
import { DialogDescription } from "@radix-ui/react-dialog";
import { StatementComboBox } from "./StatementComboBox";

function useConnectionIds() {
  const { connections } = useConnections();
  return useMemo(() => {
    return new Set(connections.map(connection2id));
  }, [connections]);
}

function canConnect(
  source: Statement,
  target: Statement,
  existingConnectionIds: Set<string>,
) {
  if (source.Id === target.Id) {
    // Can not make connection with same statement
    return false;
  }
  // Remove connections that are already present
  const possibleConnections = new Set(
    statementPair2PossibleConnections(source, target).map(connection2id),
  );
  let remainingPossibleConnectionCount = possibleConnections.size;
  for (const possibleConnection of possibleConnections) {
    if (existingConnectionIds.has(possibleConnection)) {
      remainingPossibleConnectionCount--;
    }
  }
  return remainingPossibleConnectionCount > 0;
}

function SourceStatementField({
  target,
  onSelect,
  source,
}: {
  target: Statement | undefined;
  onSelect: (statement: Statement) => void;
  source: Statement | undefined;
}) {
  const { statements: allStatements } = useStatements();
  const existingConnectionIds = useConnectionIds();
  const statements = useMemo(() => {
    if (target) {
      return allStatements.filter((statement) =>
        canConnect(statement, target, existingConnectionIds),
      );
    }
    return allStatements;
  }, [allStatements, existingConnectionIds, target]);
  return (
    <StatementComboBox
      statements={statements}
      value={source}
      onChange={onSelect}
    />
  );
}

function TargetStatementField({
  target,
  onSelect,
  source,
}: {
  target: Statement | undefined;
  onSelect: (statement: Statement) => void;
  source: Statement | undefined;
}) {
  const { statements: allStatements } = useStatements();
  const existingConnectionIds = useConnectionIds();
  const statements = useMemo(() => {
    if (source) {
      return allStatements.filter((statement) =>
        canConnect(source, statement, existingConnectionIds),
      );
    }
    return allStatements;
  }, [allStatements, existingConnectionIds, source]);
  return (
    <StatementComboBox
      statements={statements}
      value={target}
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
  const existingConnectionIds = useConnectionIds();
  const choices = useMemo(() => {
    const possibleConnections = statementPair2PossibleConnections(
      source,
      target,
    );
    // Filter out existing connections
    return possibleConnections.filter(
      (c) => !existingConnectionIds.has(connection2id(c)),
    );
  }, [existingConnectionIds, source, target]);

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
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(!open);
        setSource(undefined);
        setTarget(undefined);
      }}
    >
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
          <SourceStatementField
            source={source}
            target={target}
            onSelect={setSource}
          />
        </fieldset>
        <fieldset className="border p-1">
          <legend>Target</legend>
          <TargetStatementField
            target={target}
            source={source}
            onSelect={setTarget}
          />
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
