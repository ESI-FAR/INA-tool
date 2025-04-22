import Graph from "graphology";
import { density } from "graphology-metrics/graph/density";
import diameter from "graphology-metrics/graph/diameter";
import betweennessCentrality from "graphology-metrics/centrality/betweenness";
import {
  inDegreeCentrality,
  outDegreeCentrality,
} from "graphology-metrics/centrality/degree";
import { useStore } from "zustand";
import { useMemo } from "react";
import { LinkIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { NamelessState, store } from "@/stores/global";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { statementLabel } from "@/lib/utils";
import {
  Deontic,
  StatementType,
  Statement,
  Connection,
  DrivenBy,
  SourceComponentSchema,
} from "@/lib/schema";
import { StatementCell } from "./StatementCell";
import { Button } from "./ui/button";

interface NodeAttributes {
  label: string;
  "Statement Type": StatementType;
  Deontic: Deontic;
}

interface EdgeAttributes {
  drivenBy?: string;
  conflict?: boolean;
}

type StatementGraph = Graph<NodeAttributes, EdgeAttributes>;

/**
 * Graph of statements and their connections.
 * Treats edges from/to components of statements as edges between statements.
 */
function statementGraph({
  statements,
  connections,
  conflicts,
}: NamelessState): StatementGraph {
  const graph = new Graph<NodeAttributes, EdgeAttributes>({
    allowSelfLoops: false,
    multi: true,
  });
  for (const statement of statements) {
    graph.addNode(statement.Id, {
      label: statementLabel(statement),
      "Statement Type": statement["Statement Type"],
      Deontic: statement["Deontic"],
    });
  }
  for (const drivenConnection of connections) {
    graph.addDirectedEdge(
      drivenConnection.source_statement,
      drivenConnection.target_statement,
      {
        drivenBy: drivenConnection.driven_by,
      },
    );
  }
  for (const conflict of conflicts) {
    graph.addDirectedEdge(conflict.formal, conflict.informal, {
      conflict: true,
    });
  }
  return graph;
}

function useStatementGraph() {
  const { statements, connections, conflicts } = useStore(store);
  const state = useMemo(
    () => ({ statements, connections, conflicts }),
    [statements, connections, conflicts],
  );
  const graph = useMemo(() => statementGraph(state), [state]);
  return graph;
}

function statementGraphMetrics(graph: StatementGraph) {
  return {
    nrStatements: graph.order,
    density: density(graph),
    diameter: diameter(graph),
    // TODO modularity per partition for example formal/informal
  };
}

function useStatementNetworkMetrics() {
  const graph = useStatementGraph();
  const metrics = useMemo(() => statementGraphMetrics(graph), [graph]);
  return metrics;
}

interface StatementMetric {
  statement: Statement;
  betweennessCentrality: number;
  outDegreeCentrality: number;
  inDegreeCentrality: number;
}

function useStatementMetrics(): StatementMetric[] {
  const graph = useStatementGraph();
  const lookup = useStatementLookup();
  const metrics = useMemo(() => {
    if (graph.order === 0) {
      return [];
    }
    const betweenCentralities = betweennessCentrality(graph);
    const outDegreeCentralities = outDegreeCentrality(graph);
    const inDegreeCentralities = inDegreeCentrality(graph);

    const result: StatementMetric[] = [];
    graph.forEachNode((node) => {
      result.push({
        statement: lookup.get(node)!,
        betweennessCentrality: betweenCentralities[node],
        outDegreeCentrality: outDegreeCentralities[node],
        inDegreeCentrality: inDegreeCentralities[node],
      });
    });
    return result;
  }, [graph, lookup]);
  return metrics;
}

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
            <TableCell>{statement.betweennessCentrality.toFixed(3)}</TableCell>
            <TableCell>{statement.outDegreeCentrality.toFixed(3)}</TableCell>
            <TableCell>{statement.inDegreeCentrality.toFixed(3)}</TableCell>
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

interface DegreeCentrality {
  statement: Statement;
  label: string;
  degree: number;
}

function useStatementLookup(): Map<string, Statement> {
  const { statements } = useStore(store);
  const statementLookup = useMemo(
    () =>
      new Map<string, Statement>(
        statements.map((statement) => [statement.Id, statement]),
      ),
    [statements],
  );
  return statementLookup;
}

function getOutgoingDegreeCentralityOfDrivenConnection(
  connections: Connection[],
  drivenBy: DrivenBy,
  statementLookup: Map<string, Statement>,
  sourceComponent: SourceComponentSchema = "Direct Object",
): DegreeCentrality[] {
  const memory = new Map<string, number>();
  for (const connection of connections) {
    if (
      connection.driven_by === drivenBy &&
      connection.source_component === sourceComponent
    ) {
      const key = connection.source_statement;
      if (memory.has(key)) {
        memory.set(key, memory.get(key)! + 1);
      } else {
        memory.set(key, 1);
      }
    }
  }
  return Array.from(memory.entries()).map(([key, degree]) => {
    const statementData = statementLookup.get(key)!;
    return {
      statement: statementData,
      label: statementData["Direct Object"]!,
      degree,
    };
  });
}

function getDegreeCentralityOfActors(
  connections: Connection[],
  statementLookup: Map<string, Statement>,
): DegreeCentrality[] {
  return getOutgoingDegreeCentralityOfDrivenConnection(
    connections,
    "actor",
    statementLookup,
    "Direct Object",
  );
}

function useDegreeCentralityOfActors() {
  const { connections } = useStore(store);
  const statementLookup = useStatementLookup();
  return useMemo(
    () => getDegreeCentralityOfActors(connections, statementLookup),
    [connections, statementLookup],
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

function getDegreeCentralityOfDirectObjects(
  connections: Connection[],
  statementLookup: Map<string, Statement>,
): DegreeCentrality[] {
  return getOutgoingDegreeCentralityOfDrivenConnection(
    connections,
    "outcome",
    statementLookup,
  );
}

function useDegreeCentralityOfDirectObjects() {
  const { connections } = useStore(store);
  const statementLookup = useStatementLookup();
  return useMemo(
    () => getDegreeCentralityOfDirectObjects(connections, statementLookup),
    [connections, statementLookup],
  );
}

function DegreeCentralityOfDirectObjects() {
  const centralities = useDegreeCentralityOfDirectObjects();
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
            actor connections for each animate direct object.
          </p>
          <DegreeCentralityOfActors />
        </article>
        <article id="degree-centrality-of-direct-objects">
          <h2 className="text-xl">Degree centrality of direct objects</h2>
          <p className="text-sm">
            Object Centrality is calculated by counting the number of outcome
            connections that stem from an inanimate direct object.
          </p>
          <DegreeCentralityOfDirectObjects />
        </article>
      </article>
    </div>
  );
}
