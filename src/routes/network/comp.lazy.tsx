import { ComponentNetworkLegend } from "@/components/NetworkLegend";
import { ComponentNetworkSearch } from "@/components/NetworkSearch";
import { ComponentNetwork } from "@/components/ComponentNetwork";
import { createLazyFileRoute } from "@tanstack/react-router";
import { ReactFlowProvider } from "@xyflow/react";
import { ComponentNetworkMenu } from "@/components/ComponentNetworkMenu";
import { useLibAvoid } from "@/components/edges";

export const Route = createLazyFileRoute("/network/comp")({
  component: RouteComponent,
});

function RouteComponent() {
  useLibAvoid();
  return (
    <ReactFlowProvider>
      <div className="flex h-full flex-col">
        <div className="flex justify-between">
          <h1 className="text-xl">Component level network</h1>
          <div className="flex gap-1">
            <ComponentNetworkSearch />
            <ComponentNetworkLegend />
            <ComponentNetworkMenu />
          </div>
        </div>
        <ComponentNetwork />
      </div>
    </ReactFlowProvider>
  );
}
