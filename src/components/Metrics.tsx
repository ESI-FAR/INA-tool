import { LinkIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { statementLabel } from "@/lib/utils";
import { StatementCell } from "./StatementCell";
import { Button } from "./ui/button";
import {
  useStatementNetworkMetrics,
  useStatementMetrics,
  useDegreeCentralityOfActors,
  useDegreeCentralityOfInanimateObjects,
  DegreeCentrality,
} from "@/hooks/use-metrics";

function StatementMetricsTable() {
  const metrics = useStatementMetrics();
  return (
    <Table>
      <TableHeader>
        {/* TODO make sortable and filterable */}
        <TableRow>
          <TableHead>Statement</TableHead>
          <TableHead>Betweenness Centrality</TableHead>
          <TableHead>Outdegree Centrality</TableHead>
          <TableHead>Indegree Centrality</TableHead>
          <TableHead>Connections</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from(metrics).map((statement) => (
          <TableRow key={statement.statement.Id}>
            <TableCell>
              <StatementCell statement={statement.statement} />
            </TableCell>
            <TableCell>{statement.betweennessCentrality}</TableCell>
            <TableCell>{statement.outDegreeCentrality}</TableCell>
            <TableCell>{statement.inDegreeCentrality}</TableCell>
            <TableCell>
              <Button variant="secondary" size="icon" asChild>
                <Link
                  to={`/connections/$statement`}
                  params={{ statement: statement.statement.Id }}
                  title="Goto connections of statement"
                >
                  <LinkIcon />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {metrics.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center text-gray-500">
              No statements found, so no metrics available. Please add some
              statements and connections.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function DegreeCentralityTable({
  centralities,
}: {
  centralities: DegreeCentrality[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Statement ID</TableHead>
          <TableHead>Component</TableHead>
          <TableHead>Degree centrality</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {centralities.map((centrality) => (
          <TableRow key={centrality.statement.Id}>
            <TableCell>{statementLabel(centrality.statement)}</TableCell>
            <TableCell className="w-full">{centrality.label}</TableCell>
            <TableCell>{centrality.degree}</TableCell>
          </TableRow>
        ))}
        {centralities.length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className="h-24 text-center text-gray-500">
              No connections found, so no metrics available. Please add some
              connections.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function DegreeCentralityOfActors() {
  const centralities = useDegreeCentralityOfActors();
  return <DegreeCentralityTable centralities={centralities} />;
}

function DegreeCentralityOfInanimateObjects() {
  const centralities = useDegreeCentralityOfInanimateObjects();
  return <DegreeCentralityTable centralities={centralities} />;
}

export function Metrics() {
  const statementNetworkMetrics = useStatementNetworkMetrics();
  return (
    <div>
      <h1 className="text-2xl">Metrics</h1>
      <article className="flex flex-col gap-4">
        <article id="statement-network-metrics">
          <h2 className="text-xl">Network level</h2>
          <ul>
            <li>
              Number of statements: {statementNetworkMetrics.nrStatements}
            </li>
            <li>Density: {statementNetworkMetrics.density.toFixed(3)}</li>
            <li>Diameter: {statementNetworkMetrics.diameter}</li>
          </ul>
        </article>
        <article id="statement-metrics">
          <h2 className="text-xl">Statement level metrics</h2>
          <StatementMetricsTable />
        </article>
        <article id="degree-centrality-of-actors">
          <h2 className="text-xl">Degree centrality of actors</h2>
          <p className="text-sm">
            A measure of the importance of actors in the institutional
            environment. Centrality is calculated by counting the number of
            actor connections incoming to each Attribute component. Attribute
            components not listed have a degree centrality of 0.
          </p>
          <DegreeCentralityOfActors />
        </article>
        <article id="degree-centrality-of-objects">
          <h2 className="text-xl">Degree centrality of objects</h2>
          <p className="text-sm">
            Object Centrality is calculated by counting the number of outcome
            connections outgoing from each inanimate direct object or inanimate
            indirect object. Objects not listed have a degree centrality of 0.
          </p>
          <DegreeCentralityOfInanimateObjects />
        </article>
      </article>
    </div>
  );
}
