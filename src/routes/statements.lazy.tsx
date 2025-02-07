import { StatementTable } from "@/components/StatementTable";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/statements")({
  component: RouteComponent,
});

function RouteComponent() {
  return <StatementTable />;
}
