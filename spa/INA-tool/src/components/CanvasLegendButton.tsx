import { AlignVerticalDistributeCenterIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

function EdgeLegend({ className, text }: { className: string; text: string }) {
  return (
    <li>
      <span className={className}>●-●</span> {text}
    </li>
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
        <PopoverContent className="w-80">
          {/* TODO add legend for nodes */}
          <p>Edges</p>
          <ul className="list-inside pl-4">
            <EdgeLegend className="text-foreground" text="Inner statement" />
            <EdgeLegend className="text-purple-500" text="Actor driven" />
            <EdgeLegend className="text-green-500" text="Outcome driven" />
            <EdgeLegend className="text-red-500" text="Sanction driven" />
          </ul>
        </PopoverContent>
      </Popover>
    </>
  );
}
