import { Statement } from "@/lib/schema";

export function StatementCell({ statement }: { statement: Statement }) {
  return (
    <div>
      <span title="Statement Id" className="hover:underline">
        {statement["Statement Type"] === "formal" ? "F" : "I"}
        {statement.Id}:
      </span>{" "}
      <span className="hover:underline" title="Attribute">
        {statement["Attribute"]}
      </span>{" "}
      {statement.Deontic && (
        <>
          <span className="hover:underline" title="Deontic">
            {statement.Deontic}
          </span>{" "}
        </>
      )}
      <span className="hover:underline" title="Aim">
        {statement["Aim"]}
      </span>{" "}
      {statement["Direct Object"] && (
        <>
          <span
            className="hover:underline"
            title={`Direct Object ${statement["Type of Direct Object"]}`}
          >
            {statement["Direct Object"]}
          </span>{" "}
        </>
      )}
      {statement["Indirect Object"] && (
        <>
          <span
            className="hover:underline"
            title={`InDirect Object ${statement["Type of Indirect Object"]}`}
          >
            {statement["Indirect Object"]}
          </span>{" "}
        </>
      )}
      {statement["Activation Condition"] && (
        <>
          <span className="hover:underline" title="Activation Condition">
            {statement["Activation Condition"]}{" "}
          </span>{" "}
        </>
      )}
      {statement["Execution Constraint"] && (
        <>
          <span className="hover:underline" title="Execution Constraint">
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
