import { StatementNetworkLegend } from "@/components/NetworkLegend";
import { StatementNetworkSearch } from "@/components/NetworkSearch";
import { StatementNetwork } from "@/components/StatementNetwork";
import { createLazyFileRoute } from "@tanstack/react-router";
import { ReactFlowProvider } from "@xyflow/react";
import { StatementNetworkMenu } from "@/components/StatementNetworkMenu";

export const Route = createLazyFileRoute("/network/statement")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ReactFlowProvider>
      <div className="flex h-full flex-col">
        <div className="flex justify-between">
          <h1 className="text-xl">Statement level network</h1>
          <div className="flex gap-1">
            <StatementNetworkSearch />
            <StatementNetworkLegend />
            <StatementNetworkMenu />
          </div>
        </div>
        <StatementNetwork />
      </div>
    </ReactFlowProvider>
  );
}
