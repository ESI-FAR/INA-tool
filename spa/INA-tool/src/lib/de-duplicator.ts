import { INAEdge } from "./edge";
import { INANode, isStatementNode } from "./node";

export function deduplicator(
  nodes: INANode[],
  edges: INAEdge[],
): { nodes: INANode[]; edges: INAEdge[] } {
  // Find all nodes with the same label and type
  const duplicatedNodesGroupByLabel = getDuplicatedNodes(nodes);
  if (duplicatedNodesGroupByLabel.size === 0) {
    // No duplicates found, returning unchanged
    return { nodes, edges };
  }

  const { edgesSourceLookup, edgesTargetLookup } =
    buildeEdgeSourceTargetLookups(edges);

  const newNodes = [...nodes];
  const newNodesIndexLookup = new Map<string, number>(
    newNodes.map((node, index) => [node.id, index]),
  );
  const newEdges = [...edges];
  const newEdgesIndexLookup = new Map<string, number>(
    newEdges.map((edge, index) => [edge.id, index]),
  );

  for (const duplicatedNodes of duplicatedNodesGroupByLabel.values()) {
    const thenode = duplicatedNodes.shift()!;
    // Hide all duplicate nodes, keep the first one shown
    for (const othernode of duplicatedNodes) {
      const nodeIndex = newNodesIndexLookup.get(othernode.id)!;
      newNodes[nodeIndex] = {
        ...othernode,
        hidden: true,
      };
      // Take edges that are connected to duplicate nodes
      // and connect them to the first node
      const sources = edgesSourceLookup.get(othernode.id);
      const targets = edgesTargetLookup.get(othernode.id);
      for (const source of sources ?? []) {
        const sourceEdgeIndex = newEdgesIndexLookup.get(source.id)!;
        newEdges[sourceEdgeIndex] = {
          ...newEdges[sourceEdgeIndex],
          source: thenode.id,
          dedupSource: newEdges[sourceEdgeIndex].source,
        };
      }
      for (const target of targets ?? []) {
        const targetEdgeIndex = newEdgesIndexLookup.get(target.id)!;
        newEdges[targetEdgeIndex] = {
          ...newEdges[targetEdgeIndex],
          target: thenode.id,
          dedupTarget: newEdges[targetEdgeIndex].target,
        };
      }
    }
  }

  return { nodes: newNodes, edges: newEdges };
}

function buildeEdgeSourceTargetLookups(edges: INAEdge[]) {
  const edgesSourceLookup = new Map<string, INAEdge[]>();
  const edgesTargetLookup = new Map<string, INAEdge[]>();
  for (const edge of edges) {
    // TODO only store edges that are connected to duplicate nodes
    const sourceKey = edge.source;
    if (edgesSourceLookup.has(sourceKey)) {
      edgesSourceLookup.get(sourceKey)!.push(edge);
    } else {
      edgesSourceLookup.set(sourceKey, [edge]);
    }
    const targetKey = edge.target;
    if (edgesTargetLookup.has(targetKey)) {
      edgesTargetLookup.get(targetKey)!.push(edge);
    } else {
      edgesTargetLookup.set(targetKey, [edge]);
    }
  }
  return { edgesSourceLookup, edgesTargetLookup };
}

function getDuplicatedNodes(nodes: INANode[]) {
  const nodesGroupedByLabel = new Map<string, INANode[]>();
  for (const node of nodes) {
    if (isStatementNode(node)) {
      continue;
    }
    const key = node.data.label + "-" + node.type;
    if (nodesGroupedByLabel.has(key)) {
      nodesGroupedByLabel.get(key)!.push(node);
    } else {
      nodesGroupedByLabel.set(key, [node]);
    }
  }
  // Remove keys with only one node
  const duplicatedNodesGroupByLabel = new Map<string, INANode[]>();
  for (const [label, nodes] of nodesGroupedByLabel.entries()) {
    if (nodes.length > 1) {
      duplicatedNodesGroupByLabel.set(label, nodes);
    }
  }
  return duplicatedNodesGroupByLabel;
}

export function duplicator(
  nodes: INANode[],
  edges: INAEdge[],
): { nodes: INANode[]; edges: INAEdge[] } {
  const duplicatedNodesGroupByLabel = getDuplicatedNodes(nodes);
  if (duplicatedNodesGroupByLabel.size === 0) {
    // No duplicates found, returning unchanged
    return { nodes, edges };
  }

  // For all non-first duplicated nodes make them visible
  const newNodes = [...nodes];
  const newNodesLookup = new Map<string, number>(
    newNodes.map((node, index) => [node.id, index]),
  );
  for (const duplicatedNodes of duplicatedNodesGroupByLabel.values()) {
    for (const othernode of duplicatedNodes.slice(1)) {
      const nodeIndex = newNodesLookup.get(othernode.id)!;
      newNodes[nodeIndex] = {
        ...othernode,
        hidden: false,
      };
    }
  }

  // Loop over all edges and move
  // dedupSource to source and dedupTarget to target
  const newEdges = edges.map((edge) => {
    if (edge.dedupSource) {
      return {
        ...edge,
        source: edge.dedupSource,
        dedupSource: undefined,
      };
    }
    if (edge.dedupTarget) {
      return {
        ...edge,
        target: edge.dedupTarget,
        dedupTarget: undefined,
      };
    }
    return edge;
  });

  return { nodes: newNodes, edges: newEdges };
}
