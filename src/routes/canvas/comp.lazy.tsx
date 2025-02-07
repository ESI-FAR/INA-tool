import { ComponentCanvas } from "@/components/ComponentCanvas";
import { createLazyFileRoute } from "@tanstack/react-router";
import { ReactFlowProvider } from "@xyflow/react";

export const Route = createLazyFileRoute("/canvas/comp")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ReactFlowProvider>
      <ComponentCanvas />
    </ReactFlowProvider>
  );
}
