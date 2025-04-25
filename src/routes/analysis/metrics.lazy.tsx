import { Metrics } from "@/components/Metrics";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/analysis/metrics")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Metrics />;
}
