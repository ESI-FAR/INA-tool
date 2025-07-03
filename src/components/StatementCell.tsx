import { ConnectionComponent, Statement } from "@/lib/schema";
import { cn } from "@/lib/utils";

export function StatementCell({
  statement,
  highlight,
  matchedItems = [],
  isSourceStatement = true,
}: {
  statement: Statement;
  highlight?: ConnectionComponent;
  matchedItems?: { source_item: string; target_item: string }[];
  isSourceStatement?: boolean;
}) {
  // Define colors for different matched pairs
  const matchColors = [
    "bg-[rgba(134,239,172,0.4)]", // green with 40% opacity
    "bg-[rgba(147,197,253,0.4)]", // blue with 40% opacity
  ];

  // Helper function to get the background color for matched items
  const getMatchedItemColor = (text: string | undefined): string => {
    if (!text || matchedItems.length === 0) return "";

    for (let i = 0; i < matchedItems.length; i++) {
      const item = matchedItems[i];
      const itemToCheck = isSourceStatement
        ? item.source_item
        : item.target_item;

      if (text.toLowerCase().includes(itemToCheck.toLowerCase())) {
        return matchColors[i % matchColors.length];
      }
    }

    return "";
  };

  // Helper function to get all CSS classes for a component
  const getComponentClasses = (
    component: ConnectionComponent,
    text: string | undefined,
  ) => {
    return cn("hover:underline", {
      "font-extrabold": highlight === component,
      [getMatchedItemColor(text)]: !!getMatchedItemColor(text),
    });
  };

  return (
    <div>
      <span title="Statement Id" className={"hover:underline"}>
        {statement["Statement Type"] === "formal" ? "F" : "I"}
        {statement.Id}:
      </span>{" "}
      <span
        className={getComponentClasses("Attribute", statement["Attribute"])}
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
        className={getComponentClasses("Aim", statement["Aim"])}
        title="Aim"
      >
        {statement["Aim"]}
      </span>{" "}
      {statement["Direct Object"] && (
        <>
          <span
            className={getComponentClasses(
              "Direct Object",
              statement["Direct Object"],
            )}
            title={`Direct Object ${statement["Type of Direct Object"]}`}
          >
            {statement["Direct Object"]}
          </span>{" "}
        </>
      )}
      {statement["Indirect Object"] && (
        <>
          <span
            className={getComponentClasses(
              "Indirect Object",
              statement["Indirect Object"],
            )}
            title={`InDirect Object ${statement["Type of Indirect Object"]}`}
          >
            {statement["Indirect Object"]}
          </span>{" "}
        </>
      )}
      {statement["Activation Condition"] && (
        <>
          <span
            className={getComponentClasses(
              "Activation Condition",
              statement["Activation Condition"],
            )}
            title="Activation Condition"
          >
            {statement["Activation Condition"]}{" "}
          </span>{" "}
        </>
      )}
      {statement["Execution Constraint"] && (
        <>
          <span
            className={getComponentClasses(
              "Execution Constraint",
              statement["Execution Constraint"],
            )}
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
