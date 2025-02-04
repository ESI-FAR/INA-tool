import { AlignVerticalDistributeCenterIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import StatementLegend from "./legend/statement.svg?react";

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

export function Legend() {
  return (
    <>
      <p>Statement</p>

      <StatementLegend width="22rem" height="8rem" />
      <p>Edges</p>
      <ul className="list-inside pl-4">
        <EdgeLegend className="text-foreground" text="Inner statement" />
        <EdgeLegend className="text-purple-500" text="Actor driven" />
        <EdgeLegend className="text-green-500" text="Outcome driven" />
        <EdgeLegend className="text-red-500" text="Sanction driven" />
      </ul>
    </>
  );
}

export function CanvasLegendButton() {
  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <AlignVerticalDistributeCenterIcon /> Legend
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96">
          <Legend />
        </PopoverContent>
      </Popover>
    </>
  );
}
