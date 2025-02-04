import {
  DrivenConnection,
  INAEdge,
  isDrivenConnectionEdge,
  isInnerStatementEdge,
} from "./edge";
import { INANode } from "./node";

/**
 * Converts react flow graph from uncompacted to compacted and vice versa.
 */
export function compacter(
  isCompact: boolean,
  nodes: INANode[],
  edges: INAEdge[],
): { nodes: INANode[]; edges: INAEdge[] } {
  // TODO switch back and forwards with auto layou in between fails for some combis
  // TODO when uploaded file has many statements then default to isCompact==true
  const newNodes = nodes.map((node) => {
    if (node.type == "statement") {
      if (isCompact) {
        return {
          ...node,
          uncompactStyle: node.style,
          style: undefined,
          width: undefined,
          height: undefined,
        };
      }
      return {
        ...node,
        style: node.uncompactStyle,
      };
    }
    return {
      ...node,
      hidden: isCompact,
    };
  });
  const innerStatemementEdges = edges
    .filter(isInnerStatementEdge)
    .map((edge) => {
      return {
        ...edge,
        hidden: isCompact,
      };
    });

  const innerNodeId2StatementId = new Map<string, string>();
  for (const node of nodes) {
    if (node.type !== "statement") {
      innerNodeId2StatementId.set(node.id, node.parentId!);
    }
  }

  let drivenConnectionEdges: DrivenConnection[] = [];
  if (isCompact) {
    // Find all driven connection edgeds that are now going from inner statement to inner node of other statement
    // and change them to go from statement to other statement
    drivenConnectionEdges = edges.filter(isDrivenConnectionEdge).map((edge) => {
      const source = innerNodeId2StatementId.get(edge.source)!;
      const target = innerNodeId2StatementId.get(edge.target)!;
      return {
        ...edge,
        source,
        uncompactSource: edge.source,
        target,
        uncompactTarget: edge.target,
      };
    });
  } else {
    // Find all driven connection edges that are going from statement to other statement
    // and change them to go from inner statement to inner node of other statement
    drivenConnectionEdges = edges.filter(isDrivenConnectionEdge).map((edge) => {
      return {
        ...edge,
        source: edge.uncompactSource!,
        target: edge.uncompactTarget!,
      };
    });
  }

  return {
    nodes: newNodes,
    edges: [...innerStatemementEdges, ...drivenConnectionEdges],
  };
}
