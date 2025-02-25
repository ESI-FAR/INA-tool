import { ComponentNetworkLegend } from "@/components/NetworkLegend";
import { ComponentNetworkSearch } from "@/components/NetworkSearch";
import { ComponentNetwork } from "@/components/ComponentNetwork";
import { ComponentLayoutButton } from "@/components/LayoutButton";
import { ScreenshotButton } from "@/components/ScreenshotButton";
import { createLazyFileRoute } from "@tanstack/react-router";
import { ReactFlowProvider } from "@xyflow/react";

export const Route = createLazyFileRoute("/network/comp")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ReactFlowProvider>
      <div className="h-full">
        <div className="flex justify-between">
          <h1 className="text-xl">Component level network</h1>
          <div className="flex gap-1">
            <ComponentNetworkSearch />
            <ComponentLayoutButton />
            <ScreenshotButton />
            <ComponentNetworkLegend />
          </div>
        </div>
        <ComponentNetwork />
      </div>
    </ReactFlowProvider>
  );
}
