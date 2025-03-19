import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  getNodesBounds,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
} from "@xyflow/react";
import {
  builderDrivenConnectionEdge,
  INACEdge,
  ComponentEdge,
  isDrivenConnectionEdge,
  isComponentEdge,
} from "../lib/edge";
import {
  ConflictGroupNode,
  INANode,
  isConflictGroupNode,
  isComponentNode,
  isStatementNode,
  StatementNode,
  StatementRelatedNode,
} from "../lib/node";
import { createStore } from "zustand";
import { store as globalStore } from "./global";
import { Conflict, Connection, Statement } from "../lib/schema";
import { DEFAULT_STATEMENT_HEIGHT, procesStatement } from "../lib/io";
import { connection2id } from "../lib/connection2id";

export type State = {
  nodes: INANode[];
  edges: INACEdge[];
  deDuplicate: boolean;
};

export type Action = {
  onNodesChange: OnNodesChange<INANode>;
  onEdgesChange: OnEdgesChange<INACEdge>;
  onConnect: OnConnect;
  setNodes: (nodes: INANode[]) => void;
  setEdges: (edges: INACEdge[]) => void;
  setDeDuplicate: (deDuplicate: boolean) => void;
};

export type Store = State & Action;

export const store = createStore<Store>((set, get) => ({
  nodes: [],
  edges: [],
  deDuplicate: false,
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  setNodes: (nodes) => {
    set({ nodes });
  },
  setEdges: (edges) => {
    set({ edges });
  },
  setDeDuplicate: (deDuplicate) => {
    set({ ...applyDeDuplicateChanges(deDuplicate, get().nodes, get().edges) });
  },
}));

function compareStatement(a: Statement, b: Statement): boolean {
  return (
    a.Id === b.Id &&
    a.Attribute === b.Attribute &&
    a.Aim === b.Aim &&
    a["Statement Type"] === b["Statement Type"] &&
    a.Deontic === b.Deontic &&
    a["Direct Object"] === b["Direct Object"] &&
    a["Type of Direct Object"] === b["Type of Direct Object"] &&
    a["Indirect Object"] === b["Indirect Object"] &&
    a["Type of Indirect Object"] === b["Type of Indirect Object"] &&
    a["Activation Condition"] === b["Activation Condition"] &&
    a["Execution Constraint"] === b["Execution Constraint"] &&
    a["Or Else"] === b["Or Else"]
  );
}

export function applyStatementsChanges(
  statements: Statement[],
  nodes: INANode[],
  edges: INACEdge[],
): [INANode[], INACEdge[]] {
  const nonStatementNodes = nodes.filter(isConflictGroupNode);
  const drivenConnectionEdges = edges.filter(isDrivenConnectionEdge);
  const nodeLookup = new Map<string, StatementRelatedNode>(
    nodes
      .filter((n) => isStatementNode(n) || isComponentNode(n))
      .map((n) => [n.id, n]),
  );
  const statementNodeLookup = new Map<string, StatementNode>(
    nodes.filter(isStatementNode).map((n) => [n.id, n]),
  );
  const newNodes: StatementRelatedNode[] = [];
  const newEdges: ComponentEdge[] = [];
  for (const statement of statements) {
    if (statementNodeLookup.has(statement.Id)) {
      // Possible updated statement
      const statementNode = statementNodeLookup.get(statement.Id)!;
      if (compareStatement(statement, statementNode.data.raw)) {
        // Same statement, no need to update
        // retain statement node, component nodes and edges
        newNodes.push(statementNode);
        const myComponentNodes = nodes
          .filter(isComponentNode)
          .filter((n) => n.parentId === statement.Id);
        newNodes.push(...myComponentNodes);
        const myComponentEdges = edges
          .filter(isComponentEdge)
          .filter((e) => e.data?.statementId === statement.Id);
        newEdges.push(...myComponentEdges);
      } else {
        // Updated statement
        // update statement node, component nodes and edges
        // but retain position, dimensions and other ReactFlow specific data
        const [myNewNodes, myNewEdges] = procesStatement(
          statement,
          statement.Id,
        );
        const myNewMergedNodes = myNewNodes.map((n) => {
          const oldNode = nodeLookup.get(n.id);
          if (!oldNode) {
            return n;
          }
          return {
            ...n,
            position: oldNode.position,
            style: oldNode.style,
          };
        });
        newNodes.push(...myNewMergedNodes);
        newEdges.push(...myNewEdges);
      }
    } else {
      // New statement
      // create statement node, component nodes, component edges
      const [myNewNodes, myNewEdges] = procesStatement(statement, statement.Id);

      // offset statement node position, to be below last statement node
      const maxY = Math.max(
        ...Array.from(statementNodeLookup.values()).map((n) => n.position.y),
        0,
      );
      // TODO use height of node with maxY instead of DEFAULT_STATEMENT_HEIGHT
      myNewNodes[0].position.y = maxY + DEFAULT_STATEMENT_HEIGHT + 10;
      statementNodeLookup.set(statement.Id, myNewNodes[0] as StatementNode);

      newNodes.push(...myNewNodes);
      newEdges.push(...myNewEdges);
    }
  }
  return [
    [...nonStatementNodes, ...newNodes],
    [...drivenConnectionEdges, ...newEdges],
  ];
}

function onStatementsChange(statements: Statement[]) {
  const [nodes, edges] = applyStatementsChanges(
    statements,
    store.getState().nodes,
    store.getState().edges,
  );
  store.getState().setNodes(nodes);
  store.getState().setEdges(edges);
}

export function applyConnectionsChanges(
  connections: Connection[],
  edges: INACEdge[],
): INACEdge[] {
  // TODO when in dedup mode, adding a connection to a dedupped node, will hide other connections to/from node
  // toggling dedup mode on -> off -> on, will show all connections again
  const connectionIds = new Set(connections.map(connection2id));

  // find connection that are already edges, no need to update them
  // as id captures all the information
  const drivenConnectionEdges = edges
    .filter(isDrivenConnectionEdge)
    .filter((edge) => connectionIds.has(edge.id));

  // find connections that are not yet edges and add them
  const edgeIds = new Set(drivenConnectionEdges.map((edge) => edge.id));
  for (const connection of connections) {
    const id = connection2id(connection);
    if (!edgeIds.has(id)) {
      // new edge
      const newEdge = builderDrivenConnectionEdge(
        id,
        connection.source_statement + "-" + connection.source_component,
        connection.target_statement + "-" + connection.target_component,
        connection.driven_by,
      );
      drivenConnectionEdges.push(newEdge);
    }
  }
  const otherEdges = edges.filter((edge) => !isDrivenConnectionEdge(edge));
  return [...otherEdges, ...drivenConnectionEdges];
}

function onConnectionsChange(connections: Connection[]) {
  const edges = applyConnectionsChanges(connections, store.getState().edges);
  store.getState().setEdges(edges);
}

function conflict2id(conflict: Conflict): string {
  return `conflict-${conflict.formal.Id}-${conflict.informal.Id}`;
}

function onConflictsChange(conflicts: Conflict[]) {
  const otherNodes = store.getState().nodes.filter(isComponentNode);
  const conflictGroupNodes = store.getState().nodes.filter(isConflictGroupNode);
  const conflictGroupNodeLookup = new Map<string, ConflictGroupNode>(
    conflictGroupNodes.map((n) => [n.id, n]),
  );
  const statementNodeLookup = new Map<string, StatementNode>(
    store
      .getState()
      .nodes.filter(isStatementNode)
      .map((n) => [n.id, n]),
  );
  // TODO conflicts that are not yet a conflict group should be added as a conflict group
  // by adding a conflict group node and adding parentid to its statement nodes
  const newNodes: Array<StatementRelatedNode | ConflictGroupNode> = [];
  for (const conflict of conflicts) {
    const id = conflict2id(conflict);
    const conflictGroupNode = conflictGroupNodeLookup.get(id);
    if (conflictGroupNode) {
      // No change, copy existing nodes
      newNodes.push(conflictGroupNode);
      newNodes.push(statementNodeLookup.get(conflict.formal.Id)!);
      newNodes.push(statementNodeLookup.get(conflict.informal.Id)!);
    } else {
      const formalNode = statementNodeLookup.get(conflict.formal.Id)!;
      const informalNode = statementNodeLookup.get(conflict.informal.Id)!;
      const bounds = getNodesBounds([formalNode, informalNode]);
      // New conflict group
      // create conflict group node
      const PAD = 10;
      const conflictGroupNode: ConflictGroupNode = {
        id,
        type: "conflict",
        data: {},
        // the conflict group should be a rectangle that contains both formal and informal nodes
        position: {
          x: bounds.x - PAD,
          y: bounds.y - PAD,
        },
        style: {
          width: bounds.width + PAD,
          height: bounds.height + PAD,
        },
      };
      newNodes.push(conflictGroupNode);
      // add parentid to statement nodes
      newNodes.push({
        ...formalNode,
        parentId: id,
        extent: "parent",
      });
      newNodes.push({
        ...informalNode,
        parentId: id,
        extent: "parent",
      });
      conflictGroupNodeLookup.set(id, conflictGroupNode);
    }
  }
  // conflict group that are not in conflicts should be removed
  // by skipping conflict group node and removing parentid from its statement nodes
  // TODO move positions of statements nodes of old conflict group, as child node positions are relative to parent
  for (const statementNode of statementNodeLookup.values()) {
    if (newNodes.includes(statementNode)) {
      continue;
    }
    if (
      statementNode.parentId !== undefined &&
      statementNode.extent === "parent"
    ) {
      // remove parentid and extent
      newNodes.push({
        ...statementNode,
        parentId: undefined,
        extent: undefined,
      });
    } else {
      newNodes.push(statementNode);
    }
  }
  store.getState().setNodes([...newNodes, ...otherNodes]);
}

function componentNodeKey(node: INANode): string {
  if (node.type === "Direct Object" || node.type === "Indirect Object") {
    return `${node.type}-${node.data.label}-${node.data.animation}`;
  }
  return `${node.type}-${node.data.label}`;
}

function applyDeDuplicateChanges(
  newMode: boolean,
  nodes: INANode[],
  edges: INACEdge[],
) {
  const nonComponentNodes = nodes.filter((n) => !isComponentNode(n));
  const nonComponentEdges: INACEdge[] = edges.filter(
    (e) => !(isComponentEdge(e) || isDrivenConnectionEdge(e)),
  );
  const componentNodes: INANode[] = nodes.filter(isComponentNode);
  const edgesBetweenComponents: INACEdge[] = edges.filter(
    (e) => isComponentEdge(e) || isDrivenConnectionEdge(e),
  );

  // find component nodes with same type and text
  const componentNodesMap = new Map<string, INANode[]>();
  for (const node of componentNodes) {
    const key = componentNodeKey(node);
    const value = componentNodesMap.get(key);
    if (value) {
      value.push(node);
    } else {
      componentNodesMap.set(key, [node]);
    }
  }
  const uniqueComponents: INANode[] = [];
  // Where key is the first node and value is the rest
  const duplicateComponents = new Map<INANode, INANode[]>();
  for (const nodes of componentNodesMap.values()) {
    if (nodes.length < 2) {
      uniqueComponents.push(nodes[0]);
    } else {
      duplicateComponents.set(nodes[0], nodes.slice(1));
    }
  }

  const touchedNodes: INANode[] = [];
  if (newMode) {
    // Turn on deduplication
    for (const [node, duplicates] of duplicateComponents.entries()) {
      for (const duplicate of duplicates) {
        // hide non-first nodes
        touchedNodes.push({
          ...duplicate,
          hidden: true,
        });
        // redirect edges of non-first nodes to first node
        const edgesWithDuplicateAsSource = edgesBetweenComponents.filter(
          (e) => e.source === duplicate.id,
        );
        for (const edge of edgesWithDuplicateAsSource) {
          const edgeIndex = edgesBetweenComponents.indexOf(edge);
          if (edgeIndex === -1) {
            console.error("Edge not found", edge);
            continue;
          }
          edgesBetweenComponents[edgeIndex] = {
            ...edge,
            data: {
              ...edge.data,
              originalSource: duplicate.id,
            },
            source: node.id,
          } as INACEdge;
        }
        const edgesWithDuplicateAsTarget = edgesBetweenComponents.filter(
          (e) => e.target === duplicate.id,
        );
        for (const edge of edgesWithDuplicateAsTarget) {
          const edgeIndex = edgesBetweenComponents.indexOf(edge);
          if (edgeIndex === -1) {
            console.error("Edge not found", edge);
            continue;
          }
          edgesBetweenComponents[edgeIndex] = {
            ...edge,
            data: {
              ...edge.data,
              originalTarget: duplicate.id,
            },
            target: node.id,
          } as INACEdge;
        }
      }
    }
  } else {
    // Turn off deduplication
    for (const duplicates of duplicateComponents.values()) {
      // show those non-first nodes again
      for (const duplicate of duplicates) {
        touchedNodes.push({
          ...duplicate,
          hidden: false,
        });
      }
    }
    // move edges from/to first node back to duplicate nodes
    for (const edge of edgesBetweenComponents) {
      if (edge.data?.originalSource) {
        const edgeIndex = edgesBetweenComponents.indexOf(edge);
        if (edgeIndex === -1) {
          console.error("Edge not found", edge);
          continue;
        }
        edgesBetweenComponents[edgeIndex] = {
          ...edge,
          source: edge.data?.originalSource,
          data: {
            ...edge.data,
            originalSource: undefined,
          },
        } as INACEdge;
      }
      if (edge.data?.originalTarget) {
        const edgeIndex = edgesBetweenComponents.indexOf(edge);
        if (edgeIndex === -1) {
          console.error("Edge not found", edge);
          continue;
        }
        edgesBetweenComponents[edgeIndex] = {
          ...edge,
          target: edge.data?.originalTarget,
          data: {
            ...edge.data,
            originalTarget: undefined,
          },
        } as INACEdge;
      }
    }
  }
  const originNodes = duplicateComponents.keys();
  return {
    nodes: [
      ...nonComponentNodes,
      ...uniqueComponents,
      ...originNodes,
      ...touchedNodes,
    ],
    edges: [...nonComponentEdges, ...edgesBetweenComponents],
    deDuplicate: newMode,
  };
}

globalStore.subscribe((state) => state.statements, onStatementsChange);
globalStore.subscribe((state) => state.connections, onConnectionsChange);
globalStore.subscribe((state) => state.conflicts, onConflictsChange);
