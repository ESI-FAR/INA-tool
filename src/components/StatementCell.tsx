import { ConnectionComponent, Statement } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { MatchedItem } from "@/lib/schema";

// Define colors for different matched pairs
const matchColors = [
  "bg-[rgba(134,239,172,0.4)]", // green with 40% opacity
  "bg-[rgba(147,197,253,0.4)]", // blue with 40% opacity
];

// Helper function to get all matches for a component
const getMatchesForComponent = (
  text: string | undefined,
  component: ConnectionComponent,
  matchedItems: MatchedItem[],
  isSourceStatement: boolean,
): Array<{ text: string; color: string }> => {
  if (!text || matchedItems.length === 0) return [];

  const matches = [];
  for (let i = 0; i < matchedItems.length; i++) {
    const item = matchedItems[i];
    const itemToCheck =
      isSourceStatement && !item.reverse_connection
        ? item.source_item
        : item.target_item;
    const componentToCheck =
      isSourceStatement && !item.reverse_connection
        ? item.source_component
        : item.target_component;

    if (component === componentToCheck) {
      if (text.toLowerCase().includes(itemToCheck.toLowerCase())) {
        matches.push({
          text: itemToCheck,
          color: matchColors[i % matchColors.length],
        });
      }
    }
  }

  return matches;
};

// Helper function to render text with multiple highlights
function TextWithHighlights({
  text,
  component,
  title,
  matchedItems,
  isSourceStatement,
  highlight,
}: {
  text: string | undefined;
  component: ConnectionComponent;
  title: string;
  highlight?: ConnectionComponent;
  matchedItems: MatchedItem[];
  isSourceStatement: boolean;
}) {
  if (!text) return null;

  const matches = getMatchesForComponent(
    text,
    component,
    matchedItems,
    isSourceStatement,
  );
  const isHighlighted = highlight === component;

  // If there are no matches, render normally
  if (matches.length === 0) {
    return (
      <span
        className={cn("hover:underline", {
          "font-extrabold": isHighlighted,
        })}
        title={title}
      >
        {text}
      </span>
    );
  }

  // Create segments with their highlight information
  const segments = [];
  let currentIndex = 0;
  const lowerText = text.toLowerCase();

  // Find all match positions
  const matchPositions: Array<{
    start: number;
    end: number;
    color: string;
    text: string;
  }> = [];
  matches.forEach((match) => {
    const lowerMatchText = match.text.toLowerCase();
    if (lowerMatchText.length === 0) return; // Prevent infinite loop

    let searchIndex = 0;
    let foundIndex = lowerText.indexOf(lowerMatchText, searchIndex);

    while (foundIndex !== -1) {
      matchPositions.push({
        start: foundIndex,
        end: foundIndex + match.text.length,
        color: match.color,
        text: text.substring(foundIndex, foundIndex + match.text.length),
      });
      searchIndex = foundIndex + 1;
      foundIndex = lowerText.indexOf(lowerMatchText, searchIndex);
    }
  });

  // Sort by start position and remove overlaps (keep first occurrence)
  matchPositions.sort((a, b) => a.start - b.start);
  const nonOverlappingMatches: Array<{
    start: number;
    end: number;
    color: string;
    text: string;
  }> = [];
  let lastEnd = 0;

  matchPositions.forEach((match) => {
    if (match.start >= lastEnd) {
      nonOverlappingMatches.push(match);
      lastEnd = match.end;
    }
  });

  // Build segments
  nonOverlappingMatches.forEach((match) => {
    // Add text before the match
    if (match.start > currentIndex) {
      segments.push({
        text: text.substring(currentIndex, match.start),
        highlighted: false,
        color: "",
      });
    }

    // Add the highlighted match
    segments.push({
      text: match.text,
      highlighted: true,
      color: match.color,
    });

    currentIndex = match.end;
  });

  // Add remaining text after last match
  if (currentIndex < text.length) {
    segments.push({
      text: text.substring(currentIndex),
      highlighted: false,
      color: "",
    });
  }

  return (
    <span
      className={cn("hover:underline", {
        "font-extrabold": isHighlighted,
      })}
      title={title}
    >
      {segments.map((segment, index) =>
        segment.highlighted ? (
          <span key={index} className={segment.color}>
            {segment.text}
          </span>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </span>
  );
}

export function StatementCell({
  statement,
  highlight,
  matchedItems = [],
  isSourceStatement = true,
}: {
  statement: Statement;
  highlight?: ConnectionComponent;
  matchedItems?: MatchedItem[];
  isSourceStatement?: boolean;
}) {
  return (
    <div>
      <span title="Statement Id" className={"hover:underline"}>
        {statement["Statement Type"] === "formal" ? "F" : "I"}
        {statement.Id}:
      </span>{" "}
      <TextWithHighlights
        text={statement["Attribute"]}
        component="Attribute"
        title="Attribute"
        highlight={highlight}
        matchedItems={matchedItems}
        isSourceStatement={isSourceStatement}
      />{" "}
      {statement.Deontic && (
        <>
          <span className="hover:underline" title="Deontic">
            {statement.Deontic}
          </span>{" "}
        </>
      )}
      <TextWithHighlights
        text={statement["Aim"]}
        component="Aim"
        title="Aim"
        highlight={highlight}
        matchedItems={matchedItems}
        isSourceStatement={isSourceStatement}
      />{" "}
      <TextWithHighlights
        text={statement["Direct Object"]}
        component="Direct Object"
        title="Direct Object"
        highlight={highlight}
        matchedItems={matchedItems}
        isSourceStatement={isSourceStatement}
      />{" "}
      <TextWithHighlights
        text={statement["Indirect Object"]}
        component="Indirect Object"
        title="Indirect Object"
        highlight={highlight}
        matchedItems={matchedItems}
        isSourceStatement={isSourceStatement}
      />{" "}
      <TextWithHighlights
        text={statement["Activation Condition"]}
        component="Activation Condition"
        title="Activation Condition"
        highlight={highlight}
        matchedItems={matchedItems}
        isSourceStatement={isSourceStatement}
      />{" "}
      <TextWithHighlights
        text={statement["Execution Constraint"]}
        component="Execution Constraint"
        title="Execution Constraint"
        highlight={highlight}
        matchedItems={matchedItems}
        isSourceStatement={isSourceStatement}
      />{" "}
      {statement["Or Else"] && (
        <span title="Or Else" className="hover:underline">
          {statement["Or Else"]}
        </span>
      )}
    </div>
  );
}
