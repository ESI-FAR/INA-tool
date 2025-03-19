import { ComponentNetworkLegend } from "@/components/NetworkLegend";
import { ComponentNetworkSearch } from "@/components/NetworkSearch";
import { ComponentNetwork } from "@/components/ComponentNetwork";
import { createLazyFileRoute } from "@tanstack/react-router";
import { ReactFlowProvider } from "@xyflow/react";
import { ComponentNetworkMenu } from "@/components/ComponentNetworkMenu";
import { useEffect } from "react";
import { store } from "@/stores/component-network";

export const Route = createLazyFileRoute("/network/comp")({
  component: RouteComponent,
});

function RouteComponent() {
  useEffect(() => {
    return () => {
      // makes sure editing on other pages, and navigating back to this page,
      // does not have a mix of de-duplicated nodes/edges and duplicated nodes/edges
      // TODO find a better way to handle this
      store.getState().setDeDuplicate(false);
    };
  }, []);
  return (
    <ReactFlowProvider>
      <div className="h-full">
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
