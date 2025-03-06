import { ConnectionComponent, Statement } from "@/lib/schema";
import { useMemo } from "react";
import { useConnections } from "@/hooks/use-connections";
import { cn } from "@/lib/utils";
import { connection2id } from "@/lib/connection2id";
import { textColor } from "./drivenColors";

function ComponentWithConnections({
  statement,
  component,
  title = component,
}: {
  statement: Statement;
  component: ConnectionComponent;
  title?: string;
}) {
  const { connectionsOfComponent } = useConnections();
  const { incoming, outgoing } = useMemo(() => {
    const connections = connectionsOfComponent(statement.Id, component);
    const incoming = connections.filter(
      (connection) => connection.target_statement === statement.Id,
    );
    const outgoing = connections.filter(
      (connection) => connection.source_statement === statement.Id,
    );
    return { incoming, outgoing };
  }, [connectionsOfComponent, statement.Id, component]);
  return (
    <span className="hover:underline">
      {incoming.map((connection) => (
        <span
          key={connection2id(connection)}
          className={cn("ps-2", textColor[connection.driven_by])}
          title={`Connection driven by ${connection.driven_by} from ${connection.source_statement}:${connection.source_component}`}
        >
          ➜●{" "}
        </span>
      ))}
      <span title={title}>{statement[component]}</span>
      {outgoing.map((connection) => (
        <span
          key={connection2id(connection)}
          className={cn("ps-2", textColor[connection.driven_by])}
          title={`Connection driven by ${connection.driven_by} to ${connection.target_statement}:${connection.target_component}`}
        >
          {" "}
          ●➜
        </span>
      ))}{" "}
    </span>
  );
}

export function StatementCard({
  statement,
  className,
}: {
  statement: Statement;
  className?: string;
}) {
  return (
    <div
      className={cn("w-96 bg-card p-2 text-card-foreground shadow", className)}
    >
      <span title="Statement Id" className="hover:underline">
        {statement["Statement Type"] === "formal" ? "F" : "I"}
        {statement.Id}:{" "}
      </span>
      <ComponentWithConnections statement={statement} component="Attribute" />{" "}
      {statement.Deontic && (
        <span className="hover:underline" title="Deontic">
          {statement.Deontic}{" "}
        </span>
      )}
      <ComponentWithConnections statement={statement} component="Aim" />
      {statement["Direct Object"] && (
        <ComponentWithConnections
          statement={statement}
          component="Direct Object"
          title={`Direct Object ${statement["Type of Direct Object"]}`}
        />
      )}
      {statement["Indirect Object"] && (
        <ComponentWithConnections
          statement={statement}
          component="Indirect Object"
          title={`Indirect Object ${statement["Type of Indirect Object"]} `}
        />
      )}
      {statement["Activation Condition"] && (
        <ComponentWithConnections
          statement={statement}
          component="Activation Condition"
        />
      )}
      {statement["Execution Constraint"] && (
        <ComponentWithConnections
          statement={statement}
          component="Execution Constraint"
        />
      )}
      {statement["Or Else"] && (
        <span title="Or Else" className="hover:underline">
          {statement["Or Else"]}
        </span>
      )}
    </div>
  );
}
