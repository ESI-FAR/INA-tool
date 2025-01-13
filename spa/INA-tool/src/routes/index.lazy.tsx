import { StatementTable } from "@/components/StatementTable";
import { StatementGraph } from "@/components/StatementGraph";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <StatementGraph />
      <StatementTable />
    </>
  );
}
