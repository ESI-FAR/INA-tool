import { DrivenConnectionTable } from "@/components/DrivenConnectionTable";
import { useConnectionsWithValues } from "@/hooks/use-connections";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/connections/")({
  component: RouteComponent,
});

function RouteComponent() {
  const connections = useConnectionsWithValues();
  return <DrivenConnectionTable connections={connections} />;
}
