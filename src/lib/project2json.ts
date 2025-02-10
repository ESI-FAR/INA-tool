import { store as componentGraphStore } from "./graph-store/component";
import { store as statementGraphStore } from "./graph-store/statement";
import { store } from "./store";

export function project2json() {
  const body = {
    statements: store.getState().statements,
    connections: store.getState().connections,
    conflicts: store.getState().conflicts,
    graph: {
      component: {
        nodes: componentGraphStore.getState().nodes,
        edges: componentGraphStore.getState().edges,
      },
      statement: {
        nodes: statementGraphStore.getState().nodes,
        edges: statementGraphStore.getState().edges,
      },
    },
  };
  return JSON.stringify(body, null, 2);
}

export function json2project(content: string, projectName: string) {
  const state = JSON.parse(content);
  // TODO validate state using zod
  componentGraphStore.setState({
    nodes: state.graph.component.nodes,
    edges: state.graph.component.edges,
  });
  statementGraphStore.setState({
    nodes: state.graph.statement.nodes,
    edges: state.graph.statement.edges,
  });
  store.setState({
    projectName,
    statements: state.statements,
    connections: state.connections,
    conflicts: state.conflicts,
  });
}
