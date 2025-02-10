import { CanvasLegendButton } from "@/components/CanvasLegendButton";
import { ComponentCanvasSearchButton } from "@/components/CanvasSearch";
import { ComponentCanvas } from "@/components/ComponentCanvas";
import { ComponentLayoutButton } from "@/components/LayoutButton";
import { ScreenshotButton } from "@/components/ScreenshotButton";
import { createLazyFileRoute } from "@tanstack/react-router";
import { ReactFlowProvider } from "@xyflow/react";

export const Route = createLazyFileRoute("/canvas/comp")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ReactFlowProvider>
      <div className="h-full">
        <div className="flex justify-between">
          <h1 className="text-xl">Component level network</h1>
          <div className="flex gap-1">
            <ComponentCanvasSearchButton />
            <ComponentLayoutButton />
            <ScreenshotButton />
            <CanvasLegendButton />
          </div>
        </div>
        <ComponentCanvas />
      </div>
    </ReactFlowProvider>
  );
}
