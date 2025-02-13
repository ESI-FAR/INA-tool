import { ConnectionComponent, DrivenBy, Statement } from "@/lib/schema";
import { useMemo } from "react";
import { Fragment } from "react/jsx-runtime";
import { useConnections } from "@/hooks/use-connections";
import { cn } from "@/lib/utils";
import { connection2id } from "@/lib/connection2id";

const drivenByTextColors: Record<DrivenBy, string> = {
  actor: "text-purple-500",
  outcome: "text-green-500",
  sanction: "text-red-500",
} as const;

function ComponentWithConnections({
  statement,
  component,
}: {
  statement: Statement;
  component: ConnectionComponent;
}) {
  const { connectionsOfComponent } = useConnections();
  const { incoming, outgoing } = useMemo(() => {
    const connections = connectionsOfComponent(statement.Id!, component);
    const incoming = connections.filter(
      (connection) => connection.target_statement === statement.Id,
    );
    const outgoing = connections.filter(
      (connection) => connection.source_statement === statement.Id,
    );
    return { incoming, outgoing };
  }, [connectionsOfComponent, statement.Id, component]);
  return (
    <>
      <span>{statement[component]}</span>
      {incoming.map((connection) => (
        <span
          key={connection2id(connection)}
          className={cn("ps-2", drivenByTextColors[connection.driven_by])}
          title={`Connection driven by ${connection.driven_by} from ${connection.source_statement}:${connection.source_component}`}
        >
          ➜●
        </span>
      ))}
      {outgoing.map((connection) => (
        <span
          key={connection2id(connection)}
          className={cn("ps-2", drivenByTextColors[connection.driven_by])}
          title={`Connection driven by ${connection.driven_by} to ${connection.target_statement}:${connection.target_component}`}
        >
          ●➜
        </span>
      ))}
    </>
  );
}

export function StatementCard({ statement }: { statement: Statement }) {
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
          <ComponentWithConnections
            statement={statement}
            component="Attribute"
          />
        </dd>
        {statement.Deontic && (
          <Fragment key="Deontic">
            <dt className="font-semibold">Deontic:</dt>
            <dd>{statement.Deontic}</dd>
          </Fragment>
        )}
        <dt className="font-semibold">Aim:</dt>
        <dd>
          <ComponentWithConnections statement={statement} component="Aim" />
        </dd>
        {statement["Direct Object"] && (
          <Fragment key="Direct Object">
            <dt className="font-semibold">Direct Object:</dt>
            <dd>
              <ComponentWithConnections
                statement={statement}
                component="Direct Object"
              />
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
              <ComponentWithConnections
                statement={statement}
                component="Indirect Object"
              />
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
              <ComponentWithConnections
                statement={statement}
                component="Activation Condition"
              />
            </dd>
          </Fragment>
        )}
        {statement["Execution Constraint"] && (
          <Fragment key="Execution Constraint">
            <dt className="font-semibold">Execution Constraint:</dt>
            <dd>
              <ComponentWithConnections
                statement={statement}
                component="Execution Constraint"
              />
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
