import { Statement } from "@/lib/schema";
import { cn, statementLabel } from "@/lib/utils";

function Highlight({ text, query }: { text: string; query: string }) {
  // TODO not highlight whole text, but only the part that matches the query
  const matches = query !== "" && text.includes(query);
  return <span className={cn({ "font-bold": matches })}>{text}</span>;
}

export function Hit({
  statement,
  query,
  className = "",
}: {
  statement: Statement;
  query: string;
  className?: string;
}) {
  return (
    <p className={className}>
      <span>{statementLabel(statement)}: </span>
      <Highlight text={statement.Attribute} query={query} />{" "}
      <span>{statement.Deontic}</span>{" "}
      <Highlight text={statement.Aim} query={query} />{" "}
      {statement["Direct Object"] && (
        <>
          <span title={statement["Type of Direct Object"]}>
            <Highlight text={statement["Direct Object"]} query={query} />
          </span>{" "}
        </>
      )}
      {statement["Indirect Object"] && (
        <>
          <span title={statement["Type of Indirect Object"]}>
            <Highlight text={statement["Indirect Object"]} query={query} />
          </span>{" "}
        </>
      )}
      <Highlight text={statement["Activation Condition"] ?? ""} query={query} />{" "}
      <Highlight text={statement["Execution Constraint"] ?? ""} query={query} />
    </p>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function searchStatement(query: string, statement: Statement) {
  const label = statementLabel(statement);
  return (
    label === query ||
    statement.Attribute.includes(query) ||
    statement.Aim.includes(query) ||
    statement["Activation Condition"]?.includes(query) ||
    statement["Direct Object"]?.includes(query) ||
    statement["Indirect Object"]?.includes(query) ||
    statement["Execution Constraint"]?.includes(query) ||
    statement["Or Else"]?.includes(query)
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function filterStatements(query: string, statements: Statement[]) {
  if (query === "") {
    return statements;
  }
  return statements.filter((statement) => searchStatement(query, statement));
}
