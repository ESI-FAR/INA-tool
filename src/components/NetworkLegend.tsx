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
    <li className="flex gap-2">
      <div className={cn("w-8", className)}>●-●</div>
      <div>{text}</div>
    </li>
  );
}

function DashedIcon({ className }: { className?: string }) {
  return (
    <svg
      height="1em"
      viewBox="0 0 36 24"
      strokeWidth="2"
      stroke="currentColor"
      className={className}
    >
      <title>Dashed icon</title>
      <g strokeWidth="2">
        <path d="M5 12h2"></path>
        <path d="M11 12h2"></path>
        <path d="M17 12h2"></path>
        <path d="M23 12h2"></path>
        <path d="M29 12h2"></path>
      </g>
    </svg>
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
          <li className="flex items-center gap-2">
            <div className="w-8">
              <DashedIcon className="text-red-500" />
            </div>
            <div>Conflict</div>
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
