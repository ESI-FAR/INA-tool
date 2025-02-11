import { DrivenBy, Statement } from "@/lib/schema";
import { useMemo } from "react";
import { Fragment } from "react/jsx-runtime";
import { useConnections } from "@/hooks/use-connections";

function Outgoing({ type }: { type: DrivenBy }) {
  if (type === "actor") {
    return (
      <span
        title="Actor driven connection source"
        className="ps-2 text-purple-500"
      >
        ●➜
      </span>
    );
  } else if (type === "outcome") {
    return (
      <span
        title="Outcome driven connection source"
        className="ps-2 text-green-500"
      >
        ●➜
      </span>
    );
  }
  return (
    <span
      title="Sanction driven connection source"
      className="ps-2 text-red-500"
    >
      ●➜
    </span>
  );
}

function Incoming({ type }: { type: DrivenBy }) {
  if (type === "actor") {
    return (
      <span
        title="Actor driven connection target"
        className="ps-2 text-purple-500"
      >
        ➜●
      </span>
    );
  } else if (type === "outcome") {
    return (
      <span
        title="Outcome driven connection target"
        className="ps-2 text-green-500"
      >
        ➜●
      </span>
    );
  }
  return (
    <span
      title="Sanction driven connection target"
      className="ps-2 text-red-500"
    >
      ➜●
    </span>
  );
}

function useConnectionsOfStatement(statementId: string) {
  const { connections } = useConnections();
  return useMemo(() => {
    const incoming = new Map<string, DrivenBy>();
    const outgoing = new Map<string, DrivenBy>();
    for (const connection of connections) {
      if (connection.source_statement === statementId) {
        outgoing.set(connection.target_statement, connection.driven_by);
      } else if (connection.target_statement === statementId) {
        incoming.set(connection.source_statement, connection.driven_by);
      }
    }
    return { incoming, outgoing };
  }, [connections, statementId]);
}

export function StatementCard({ statement }: { statement: Statement }) {
  const connections = useConnectionsOfStatement(statement.Id!);

  return (
    <div className="bg-card p-2 text-card-foreground shadow">
      <div className="absolute right-0 top-0 z-10 cursor-pointer p-1 text-muted-foreground hover:text-foreground">
        ✕
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-2 text-sm">
        <dt className="font-semibold">Statement Type:</dt>
        <dd>{statement["Statement Type"]}</dd>
        <dt className="font-semibold">Attribute:</dt>
        <dd>
          {statement.Attribute}
          {connections.incoming.has("attribute") && (
            <Incoming type={connections.incoming.get("attribute")!} />
          )}
        </dd>
        {statement.Deontic && (
          <Fragment key="Deontic">
            <dt className="font-semibold">Deontic:</dt>
            <dd>{statement.Deontic}</dd>
          </Fragment>
        )}
        <dt className="font-semibold">Aim:</dt>
        <dd>
          {statement.Aim}
          {connections.outgoing.has("aim") && (
            <Outgoing type={connections.outgoing.get("aim")!} />
          )}
        </dd>
        {statement["Direct Object"] && (
          <Fragment key="Direct Object">
            <dt className="font-semibold">Direct Object:</dt>
            <dd>
              {statement["Direct Object"]}
              {connections.outgoing.has("direct-object") && (
                <Outgoing type={connections.outgoing.get("direct-object")!} />
              )}
            </dd>
          </Fragment>
        )}
        {statement["Type of Direct Object"] && (
          <Fragment key="Type of Direct Object">
            <dt className="font-semibold">Type of Direct Object:</dt>
            <dd>{statement["Type of Direct Object"]}</dd>
          </Fragment>
        )}
        {statement["Indirect Object"] && (
          <Fragment key="Indirect Object">
            <dt className="font-semibold">Indirect Object:</dt>
            <dd>
              {statement["Indirect Object"]}
              {connections.outgoing.has("indirect-object") && (
                <Outgoing type={connections.outgoing.get("indirect-object")!} />
              )}
            </dd>
          </Fragment>
        )}
        {statement["Type of Indirect Object"] && (
          <Fragment key="Type of Indirect Object">
            <dt className="font-semibold">Type of Indirect Object:</dt>
            <dd>{statement["Type of Indirect Object"]}</dd>
          </Fragment>
        )}
        {statement["Activation Condition"] && (
          <Fragment key="Activation Condition">
            <dt className="font-semibold">Activation Condition:</dt>
            <dd>
              {statement["Activation Condition"]}
              {connections.incoming.has("activation-condition") && (
                <Incoming
                  type={connections.incoming.get("activation-condition")!}
                />
              )}
            </dd>
          </Fragment>
        )}
        {statement["Execution Constraint"] && (
          <Fragment key="Execution Constraint">
            <dt className="font-semibold">Execution Constraint:</dt>
            <dd>
              {statement["Execution Constraint"]}
              {connections.outgoing.has("execution-constraint") && (
                <Outgoing
                  type={connections.outgoing.get("execution-constraint")!}
                />
              )}
            </dd>
          </Fragment>
        )}
        {statement["Or Else"] && (
          <Fragment key="Or Else">
            <dt className="font-semibold">Or Else:</dt>
            <dd>{statement["Or Else"]}</dd>
          </Fragment>
        )}
      </dl>
    </div>
  );
}
