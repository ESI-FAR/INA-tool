import { toast } from "sonner";
import { Connection, Statement, statementsSchema } from "@/lib/schema";
import NlpWorker from "@/nlp/worker?worker";
import { mockStatements } from "@/nlp/testdata/testData";
import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useStatements } from "@/hooks/use-statements";
import { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/analysis/propose-connections")({
  component: RouteComponent,
});

function RouteComponent() {
  const [results, setResults] = useState<Connection[]>([]);
  const { statements } = useStatements();
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
    const formData = new FormData(event.currentTarget);
    const where = formData.get("where");
    let statements2process = statements;
    if (where === "text") {
      const statementsAsJSONstring = formData.get("statements");
      if (typeof statementsAsJSONstring !== "string") {
        console.error("No statements provided");
        return;
      }
      const rawStatements = JSON.parse(statementsAsJSONstring);

      statements2process = statementsSchema.parse(rawStatements) as Statement[];
    }
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
      payload: statements2process,
    });
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="mb-4 text-2xl font-bold">NLP Analysis</h1>
      <form className="space-y-6" onSubmit={performAnalysis}>
        <div className="flex flex-col gap-2" >
          <Label
            htmlFor="text-input"
          >
            Enter statements as JSON to analyze
          </Label>
          <Textarea
            name="statements"
            defaultValue={JSON.stringify(mockStatements, null, 2)}
            rows={6}
            className="w-full rounded-md border border-gray-300 bg-primary-foreground p-2 text-primary"
            placeholder="Paste your text here for NLP analysis..."
          />
          <RadioGroup defaultValue="text" className="flex" name="where">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="text" id="text" />
              <Label htmlFor="text">From Text</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="app" id="app" />
              <Label htmlFor="app">From App</Label>
            </div>
          </RadioGroup>
        </div>

        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Analyze
        </button>
      </form>
      <div>
        {results.length > 0 && (
          <ul className="list-disc space-y-2 list-inside">
            {results.map((c, i) => (
              <li key={i}>
                {c.driven_by}: {c.source_statement}:{c.source_component} =&gt;{" "}
                {c.target_statement}:{c.target_component}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
