import { AlignVerticalDistributeCenterIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import StatementLegend from "./legend/statement.svg?react";
import { statementBackground } from "./nodes";
import { cn } from "@/lib/utils";
import { textColor } from "./drivenColors";
import { ReactNode } from "react";

/*
 * The legend/statement.svg was exported from https://excalidraw.com/ with embedded scene and
 * then converted to a React component using the Vite plugin vite-plugin-svgr with color replacement.
 *
 * To edit open the SVG file on https://excalidraw.com/ and export it again.
 */

function EdgeLegend({ className, text }: { className: string; text: string }) {
  return (
    <li>
      <span className={className}>●-●</span> {text}
    </li>
  );
}

function BaseLegend({
  statement,
  edges,
}: {
  statement?: ReactNode;
  edges?: ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <AlignVerticalDistributeCenterIcon /> Legend
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <p>Statement</p>

        {statement}

        <ul className="flex flex-row gap-1">
          <li className={cn("rounded p-1", statementBackground["formal"])}>
            Formal
          </li>
          <li className={cn("rounded p-1", statementBackground["informal"])}>
            Informal
          </li>
        </ul>

        <p>Edges</p>
        <ul className="list-inside pl-4">
          {edges}
          <EdgeLegend className={textColor.actor} text="Actor driven" />
          <EdgeLegend className={textColor.outcome} text="Outcome driven" />
          <EdgeLegend className={textColor.sanction} text="Sanction driven" />
          <li>
            {/* TODO make conflict icon + text align with other edges */}
            <span className="text-red-500">━ ━ ━</span> Conflict
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  );
}

export function ComponentNetworkLegend() {
  return (
    <BaseLegend
      statement={<StatementLegend width="22rem" height="8rem" />}
      edges={<EdgeLegend className="text-foreground" text="Component" />}
    />
  );
}

export function StatementNetworkLegend() {
  return <BaseLegend />;
}
