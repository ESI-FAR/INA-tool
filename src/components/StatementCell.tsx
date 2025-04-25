import { ConnectionComponent, Statement } from "@/lib/schema";
import { cn } from "@/lib/utils";

export function StatementCell({
  statement,
  highlight,
}: {
  statement: Statement;
  highlight?: ConnectionComponent;
}) {
  return (
    <div>
      <span title="Statement Id" className={"hover:underline"}>
        {statement["Statement Type"] === "formal" ? "F" : "I"}
        {statement.Id}:
      </span>{" "}
      <span
        className={cn("hover:underline", {
          "font-extrabold": highlight === "Attribute",
        })}
        title="Attribute"
      >
        {statement["Attribute"]}
      </span>{" "}
      {statement.Deontic && (
        <>
          <span className="hover:underline" title="Deontic">
            {statement.Deontic}
          </span>{" "}
        </>
      )}
      <span
        className={cn("hover:underline", {
          "font-extrabold": highlight === "Aim",
        })}
        title="Aim"
      >
        {statement["Aim"]}
      </span>{" "}
      {statement["Direct Object"] && (
        <>
          <span
            className={cn("hover:underline", {
              "font-extrabold": highlight === "Direct Object",
            })}
            title={`Direct Object ${statement["Type of Direct Object"]}`}
          >
            {statement["Direct Object"]}
          </span>{" "}
        </>
      )}
      {statement["Indirect Object"] && (
        <>
          <span
            className={cn("hover:underline", {
              "font-extrabold": highlight === "Indirect Object",
            })}
            title={`InDirect Object ${statement["Type of Indirect Object"]}`}
          >
            {statement["Indirect Object"]}
          </span>{" "}
        </>
      )}
      {statement["Activation Condition"] && (
        <>
          <span
            className={cn("hover:underline", {
              "font-extrabold": highlight === "Activation Condition",
            })}
            title="Activation Condition"
          >
            {statement["Activation Condition"]}{" "}
          </span>{" "}
        </>
      )}
      {statement["Execution Constraint"] && (
        <>
          <span
            className={cn("hover:underline", {
              "font-extrabold": highlight === "Execution Constraint",
            })}
            title="Execution Constraint"
          >
            {statement["Execution Constraint"]}{" "}
          </span>{" "}
        </>
      )}
      {statement["Or Else"] && (
        <span title="Or Else" className="hover:underline">
          {statement["Or Else"]}
        </span>
      )}
    </div>
  );
}
