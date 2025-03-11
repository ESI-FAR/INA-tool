import { StatementNetworkLegend } from "@/components/NetworkLegend";
import { StatementNetworkSearch } from "@/components/NetworkSearch";
import { StatementLayoutButton } from "@/components/LayoutButton";
import { ScreenshotButton } from "@/components/ScreenshotButton";
import { StatementNetwork } from "@/components/StatementNetwork";
import { createLazyFileRoute } from "@tanstack/react-router";
import { ReactFlowProvider } from "@xyflow/react";

export const Route = createLazyFileRoute("/network/statement")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ReactFlowProvider>
      <div className="h-full w-full">
        <div className="flex justify-between">
          <h1 className="text-xl">Statement level network</h1>
          <div className="flex gap-1">
            <StatementNetworkSearch />
            <StatementLayoutButton />
            <ScreenshotButton />
            <StatementNetworkLegend />
          </div>
        </div>
        <StatementNetwork />
      </div>
    </ReactFlowProvider>
  );
}
