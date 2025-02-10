import { StatementCanvasLegendButton } from "@/components/CanvasLegendButton";
import { StatementCanvasSearchButton } from "@/components/CanvasSearch";
import { StatementLayoutButton } from "@/components/LayoutButton";
import { ScreenshotButton } from "@/components/ScreenshotButton";
import { StatementCanvas } from "@/components/StatementCanvas";
import { createLazyFileRoute } from "@tanstack/react-router";
import { ReactFlowProvider } from "@xyflow/react";

export const Route = createLazyFileRoute("/canvas/statement")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ReactFlowProvider>
      <div className="h-full w-full">
        <div className="flex justify-between">
          <h1 className="text-xl">Statement level network</h1>
          <div className="flex gap-1">
            <StatementCanvasSearchButton />
            <StatementLayoutButton />
            <ScreenshotButton />
            <StatementCanvasLegendButton />
          </div>
        </div>
        <StatementCanvas />
      </div>
    </ReactFlowProvider>
  );
}
