import { toast } from "sonner";
import { Connection } from "@/lib/schema";
import NlpWorker from "@/nlp/worker?worker";
import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useStatements } from "@/hooks/use-statements";
import { useEffect, useRef } from "react";
import { useConnections, useConnectionsWithValues } from "@/hooks/use-connections";
import { ProposeConnectionsTable } from "@/components/ProposedConnectionsTable";
import { ReadOnlyDrivenConnectionTable } from "@/components/ReadOnlyDrivenConnectionTable";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/analysis/propose-connections")({
  component: RouteComponent,
});

function RouteComponent() {
  const [results, setResults] = useState<Connection[]>([]);
  const { statements } = useStatements();
  const { connections } = useConnections();
  const connectionsWithValues = useConnectionsWithValues();

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new NlpWorker();

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  async function performAnalysis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const t = toast.loading("Analyzing statements...");
    workerRef.current!.onmessage = (event) => {
      toast.dismiss(t);
      if (event.data.length > 0) {
        toast.success("Analysis complete!");
      } else {
        toast.error("No connections found");
      }
      setResults(event.data);
    };
    workerRef.current!.postMessage({
      action: "findConnections",
      payload: { statements, connections },
    });
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="mb-4 text-2xl font-bold">Propose connections</h1>
      <p>
        Find connections between current statements using natural language
        processing with a wordnet subset powered fuzzy search.
      </p>
      <form className="space-y-6" onSubmit={performAnalysis}>
        <Button type="submit">Find</Button>
      </form>
      <div>
        <h2 className="text-xl font-semibold mb-2">Suggested Connections</h2>
        <ProposeConnectionsTable connections={results} />
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Existing Connections</h2>
        <ReadOnlyDrivenConnectionTable connections={connectionsWithValues} />
      </div>
    </div>
  );
}
