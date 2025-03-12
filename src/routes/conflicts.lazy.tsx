import { ConflictsTable } from "@/components/ConflictsTable";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/conflicts")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ConflictsTable />;
}
