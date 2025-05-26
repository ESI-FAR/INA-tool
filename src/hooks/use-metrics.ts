import Graph from "graphology";
import { density } from "graphology-metrics/graph/density";
import diameter from "graphology-metrics/graph/diameter";
import betweennessCentrality from "graphology-metrics/centrality/betweenness";
import { useStore } from "zustand";
import { useMemo } from "react";

import { State, store } from "@/stores/global";
import { statementLabel } from "@/lib/utils";
import {
  Deontic,
  StatementType,
  Statement,
  Connection,
  DrivenBy,
  SourceComponentSchema,
  TargetComponentSchema,
} from "@/lib/schema";
import { useStatementLookup } from "./use-statements";

export interface NodeAttributes {
  label: string;
  "Statement Type": StatementType;
  Deontic: Deontic;
}

export interface EdgeAttributes {
  drivenBy?: string;
  conflict?: boolean;
}

export type StatementGraph = Graph<NodeAttributes, EdgeAttributes>;

type NamelessState = Omit<State, "projectName">;

export function statementGraph({
  statements,
  connections,
  conflicts,
}: NamelessState): StatementGraph {
  const graph = new Graph<NodeAttributes, EdgeAttributes>({
    // driven connection or conflict can not be against statement itself
    allowSelfLoops: false,
    // We can have a driven connection and a conflict between the same nodes.
    // so we allow multiple edges.
    multi: true,
    // All edges are directed.
    type: "directed",
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

export function useStatementGraph() {
  const { statements, connections, conflicts } = useStore(store);
  const state = useMemo(
    () => ({ statements, connections, conflicts }),
    [statements, connections, conflicts],
  );
  return useMemo(() => statementGraph(state), [state]);
}

export function statementGraphMetrics(graph: StatementGraph) {
  return {
    nrStatements: graph.order,
    density: density(graph),
    diameter: diameter(graph),
    // TODO modularity per partition for example formal/informal
  };
}

export function useStatementNetworkMetrics() {
  const graph = useStatementGraph();
  return useMemo(() => statementGraphMetrics(graph), [graph]);
}

export interface StatementMetric {
  statement: Statement;
  betweennessCentrality: number;
  outDegreeCentrality: number;
  inDegreeCentrality: number;
}

function outDegreeCentrality(graph: StatementGraph) {
  const result: Record<string, number> = {};
  graph.forEachNode((node) => {
    result[node] = graph.outDegree(node);
  });
  return result;
}

function inDegreeCentrality(graph: StatementGraph) {
  const result: Record<string, number> = {};
  graph.forEachNode((node) => {
    result[node] = graph.inDegree(node);
  });
  return result;
}

export function useStatementMetrics(): StatementMetric[] {
  const graph = useStatementGraph();
  const lookup = useStatementLookup();
  const metrics = useMemo(() => {
    if (graph.order === 0) {
      return [];
    }
    const betweenCentralities = betweennessCentrality(graph, {
      normalized: false,
    });
    const outDegreeCentralities = outDegreeCentrality(graph);
    const inDegreeCentralities = inDegreeCentrality(graph);

    const result: StatementMetric[] = [];
    graph.forEachNode((node) => {
      const outDegreeCentrality = outDegreeCentralities[node];
      const inDegreeCentrality = inDegreeCentralities[node];

      // Skip statements without connections
      if (outDegreeCentrality > 0 || inDegreeCentrality > 0) {
        result.push({
          statement: lookup.get(node)!,
          betweennessCentrality: betweenCentralities[node],
          outDegreeCentrality,
          inDegreeCentrality,
        });
      }
    });
    return result;
  }, [graph, lookup]);
  return metrics;
}

export interface DegreeCentrality {
  statement: Statement;
  label: string;
  degree: number;
}

export function getOutgoingDegreeCentralityOfDrivenConnection(
  connections: Connection[],
  drivenBy: DrivenBy,
  statementLookup: Map<string, Statement>,
  sourceComponent: SourceComponentSchema,
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
      label: statementData[sourceComponent]!,
      degree,
    };
  });
}

export function getDegreeCentralityOfActors(
  connections: Connection[],
  statementLookup: Map<string, Statement>,
): DegreeCentrality[] {
  const memory = new Map<string, number>();
  const drivenBy: DrivenBy = "actor";
  const targetComponent: TargetComponentSchema = "Attribute";
  for (const connection of connections) {
    if (
      connection.driven_by === drivenBy &&
      connection.target_component === targetComponent
    ) {
      const key = connection.target_statement;
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
      label: statementData[targetComponent]!,
      degree,
    };
  });
}

export function useDegreeCentralityOfActors() {
  const { connections } = useStore(store);
  const statementLookup = useStatementLookup();
  return useMemo(
    () => getDegreeCentralityOfActors(connections, statementLookup),
    [connections, statementLookup],
  );
}

export function getDegreeCentralityOfInanimateObjects(
  connections: Connection[],
  statementLookup: Map<string, Statement>,
): DegreeCentrality[] {
  const directObjects = getOutgoingDegreeCentralityOfDrivenConnection(
    connections,
    "outcome",
    statementLookup,
    "Direct Object",
  );
  const indirectObjects = getOutgoingDegreeCentralityOfDrivenConnection(
    connections,
    "outcome",
    statementLookup,
    "Indirect Object",
  );
  return [...directObjects, ...indirectObjects];
}

export function useDegreeCentralityOfInanimateObjects() {
  const { connections } = useStore(store);
  const statementLookup = useStatementLookup();
  return useMemo(
    () => getDegreeCentralityOfInanimateObjects(connections, statementLookup),
    [connections, statementLookup],
  );
}
