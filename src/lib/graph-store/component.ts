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
  buildEdge,
  DrivenConnectionEdge,
  INAEdge,
  InnerStatementEdge,
  isDrivenConnectionEdge,
  isInnerStatementEdge,
} from "../edge";
import {
  ConflictGroupNode,
  INANode,
  isConflictGroupNode,
  isInnerStatementNode,
  isStatementNode,
  StatementNode,
  StatementRelatedNode,
} from "../node";
import { createStore } from "zustand";
import { store as globalStore } from "../store";
import { Conflict, Connection, Statement } from "../schema";
import { DEFAULT_STATEMENT_HEIGHT, procesStatement } from "../io";

export type State = {
  nodes: INANode[];
  edges: INAEdge[];
};

export type Action = {
  onNodesChange: OnNodesChange<INANode>;
  onEdgesChange: OnEdgesChange<INAEdge>;
  onConnect: OnConnect;
  setNodes: (nodes: INANode[]) => void;
  setEdges: (edges: INAEdge[]) => void;
};

export type Store = State & Action;

export const store = createStore<Store>((set, get) => ({
  nodes: [],
  edges: [],
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

function onStatementsChange(statements: Statement[]) {
  const nonStatementNodes = store.getState().nodes.filter(isConflictGroupNode);
  const drivenConnectionEdges = store
    .getState()
    .edges.filter(isDrivenConnectionEdge);
  const nodeLookup = new Map<string, StatementRelatedNode>(
    store
      .getState()
      .nodes.filter((n) => isStatementNode(n) || isInnerStatementNode(n))
      .map((n) => [n.id, n]),
  );
  const statementNodeLookup = new Map<string, StatementNode>(
    store
      .getState()
      .nodes.filter(isStatementNode)
      .map((n) => [n.id, n]),
  );
  const newNodes: StatementRelatedNode[] = [];
  const newEdges: InnerStatementEdge[] = [];
  for (const statement of statements) {
    if (statementNodeLookup.has(statement.Id!)) {
      // Possible updated statement
      const statementNode = statementNodeLookup.get(statement.Id!)!;
      if (compareStatement(statement, statementNode.data.raw)) {
        // Same statement, no need to update
        // retain statement node, inner statement nodes and edges
        newNodes.push(statementNode);
        const myInnerNodes = store
          .getState()
          .nodes.filter(isInnerStatementNode)
          .filter((n) => n.parentId === statement.Id);
        newNodes.push(...myInnerNodes);
        const myInnerEdges = store
          .getState()
          .edges.filter(isInnerStatementEdge)
          .filter((e) => e.data?.statementId === statement.Id);
        newEdges.push(...myInnerEdges);
      } else {
        // Updated statement
        // update statement node, inner statement nodes and edges
        // but retain position, dimensions and other ReactFlow specific data
        const [myNewNodes, myNewEdges] = procesStatement(
          statement,
          statement.Id!,
        );
        const myNewMergedNodes = myNewNodes.map((n) => {
          const oldNode = nodeLookup.get(n.id)!;
          return {
            ...oldNode,
            ...n,
          } as StatementRelatedNode;
        });
        newNodes.push(...myNewMergedNodes);
        newEdges.push(...myNewEdges);
      }
    } else {
      // New statement
      // create statement node, inner statement nodes
      const [myNewNodes, myNewEdges] = procesStatement(
        statement,
        statement.Id!,
      );

      // offset statement node position, to be below last statement node
      const maxY = Math.max(
        ...Array.from(statementNodeLookup.values()).map((n) => n.position.y),
        0,
      );
      // TODO use height of node with maxY instead of DEFAULT_STATEMENT_HEIGHT
      myNewNodes[0].position.y = maxY + DEFAULT_STATEMENT_HEIGHT + 10;
      statementNodeLookup.set(statement.Id!, myNewNodes[0] as StatementNode);

      newNodes.push(...myNewNodes);
      newEdges.push(...myNewEdges);
    }
  }

  store.getState().setNodes([...nonStatementNodes, ...newNodes]);
  store.getState().setEdges([...drivenConnectionEdges, ...newEdges]);
}

function connection2id(connection: Connection): string {
  return `${connection.driver}-${connection.source_statement}-${connection.source_node}-2-${connection.source_statement}-${connection.target_node}`;
}

function onConnectionsChange(connections: Connection[]) {
  const connectionIds = new Set(connections.map(connection2id));

  // find connection that are already edges, no need to update them
  // as id captures all the information
  const drivenConnectionEdges = store
    .getState()
    .edges.filter(isDrivenConnectionEdge)
    .filter((edge) => connectionIds.has(edge.id));

  // find connections that are not yet edges and add them
  const edgeIds = new Set(drivenConnectionEdges.map((edge) => edge.id));
  for (const connection of connections) {
    const id = connection2id(connection);
    if (!edgeIds.has(id)) {
      // new edge
      const newEdge = buildEdge(
        connection.source_statement + "-" + connection.source_node,
        connection.target_statement + "-" + connection.target_node,
        (connection.driver + "-driven") as Exclude<INAEdge["type"], undefined>,
      ) as DrivenConnectionEdge;
      drivenConnectionEdges.push(newEdge);
    }
  }
  const otherEdges = store
    .getState()
    .edges.filter((edge) => !isDrivenConnectionEdge(edge));
  store.getState().setEdges([...otherEdges, ...drivenConnectionEdges]);
}

function conflict2id(conflict: Conflict): string {
  return `conflict-${conflict.formal.Id}-${conflict.informal.Id}`;
}

function onConflictsChange(conflicts: Conflict[]) {
  const otherNodes = store.getState().nodes.filter(isInnerStatementNode);
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
    if (conflictGroupNodeLookup.has(id)) {
      // No change, copy existing nodes
      newNodes.push(conflictGroupNodeLookup.get(id)!);
      newNodes.push(statementNodeLookup.get(conflict.formal.Id!)!);
      newNodes.push(statementNodeLookup.get(conflict.informal.Id!)!);
    } else {
      const formalNode = statementNodeLookup.get(conflict.formal.Id!)!;
      const informalNode = statementNodeLookup.get(conflict.informal.Id!)!;
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
  store.getState().setNodes([...otherNodes, ...newNodes]);
}

globalStore.subscribe((state) => state.statements, onStatementsChange);
globalStore.subscribe((state) => state.connections, onConnectionsChange);
globalStore.subscribe((state) => state.conflicts, onConflictsChange);
