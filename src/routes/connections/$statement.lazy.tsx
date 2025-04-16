import { DrivenConnectionTable } from "@/components/DrivenConnectionTable";
import { useConnectionsWithValuesOfStatement } from "@/hooks/use-connections";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/connections/$statement")({
  component: RouteComponent,
});

function RouteComponent() {
  const { statement } = Route.useParams();
  const connections = useConnectionsWithValuesOfStatement(statement);
  return (
    <DrivenConnectionTable statement={statement} connections={connections} />
  );
}
