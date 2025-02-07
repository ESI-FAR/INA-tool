import { DrivenConnectionTable } from "@/components/DrivenConnectionTable";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/connections")({
  component: RouteComponent,
});

function RouteComponent() {
  return <DrivenConnectionTable />;
}
