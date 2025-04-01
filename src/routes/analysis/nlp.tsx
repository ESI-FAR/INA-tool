import { Connection, Statement, statementsSchema } from '@/lib/schema';
import { findConnections } from '@/nlp/connectionFinding';
import { mockStatements } from '@/nlp/testData';
import { createFileRoute } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react';

export const Route = createFileRoute('/analysis/nlp')({
  component: RouteComponent,
})

function RouteComponent() {
    const [results, setResults] = useState<Connection[]>([]);

async function performAnalysis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const rawStatements = formData.get('statements');

    console.log("Performing analysis with the following data:");
    console.log("Statements:", rawStatements);

    const statements = statementsSchema.parse(rawStatements) as Statement[];
    const connections = await findConnections(statements)
    setResults(connections);
}

  return (
    <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">NLP Analysis</h1>
        <form className="space-y-6" onSubmit={performAnalysis}>
            <div>
                <label htmlFor="text-input" className="block text-sm font-medium mb-2">
                    Enter statements as JSON to analyze
                </label>
                <textarea
                    name="statements"
                    defaultValue={JSON.stringify(mockStatements, null, 2)}
                    rows={6}
                    className="w-full border border-gray-300 rounded-md p-2"
                    placeholder="Paste your text here for NLP analysis..."
                />
            </div>
            
            <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
                Analyze
            </button>
        </form>
        <div>
            <pre>
                {JSON.stringify(results, undefined, 2)}
            </pre>
        </div>
    </div>
  )
}
