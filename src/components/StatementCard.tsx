import { Statement } from "@/lib/schema";
import { useMemo } from "react";
import { useConnections } from "@/hooks/use-connections";

function Outgoing({ type }: { type: string }) {
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

function Incoming({ type }: { type: string }) {
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
    const incoming = new Map<string, string>();
    const outgoing = new Map<string, string>();
    for (const connection of connections) {
      if (connection.source_statement === statementId) {
        outgoing.set(connection.source_node, connection.driver);
      } else if (connection.target_statement === statementId) {
        incoming.set(connection.target_node, connection.driver);
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
      <p className="w-96">
        <span>
          {statement["Statement Type"] === "formal" ? "F" : "I"}
          {statement.Id}:{" "}
        </span>
        <span>{statement.Attribute}</span>
        {connections.incoming.has("attribute") && (
          <Incoming type={connections.incoming.get("attribute")!} />
        )}{" "}
        <span>{statement.Deontic}</span> <span>{statement.Aim}</span>
        {connections.outgoing.has("aim") && (
          <Outgoing type={connections.outgoing.get("aim")!} />
        )}{" "}
        {statement["Direct Object"] && (
          <>
            <span title={statement["Type of Direct Object"]}>
              {statement["Direct Object"]}
            </span>
            {connections.outgoing.has("direct-object") && (
              <Outgoing type={connections.outgoing.get("direct-object")!} />
            )}{" "}
          </>
        )}
        {statement["Indirect Object"] && (
          <>
            <span title={statement["Type of Indirect Object"]}>
              {statement["Indirect Object"]}
            </span>
            {connections.outgoing.has("indirect-object") && (
              <Outgoing type={connections.outgoing.get("indirect-object")!} />
            )}{" "}
          </>
        )}
        {statement["Activation Condition"] && (
          <>
            <span>{statement["Activation Condition"]}</span>
            {connections.incoming.has("activation-condition") && (
              <Incoming
                type={connections.incoming.get("activation-condition")!}
              />
            )}{" "}
          </>
        )}
        {statement["Execution Constraint"] && (
          <>
            <span>{statement["Execution Constraint"]}</span>
            {connections.outgoing.has("execution-constraint") && (
              <Outgoing
                type={connections.outgoing.get("execution-constraint")!}
              />
            )}
          </>
        )}
      </p>
    </div>
  );
}
