import { StatementCanvas } from "@/components/StatementCanvas";
import { createLazyFileRoute } from "@tanstack/react-router";
import { ReactFlowProvider } from "@xyflow/react";

export const Route = createLazyFileRoute("/canvas/statement")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ReactFlowProvider>
      <StatementCanvas />
    </ReactFlowProvider>
  );
}
