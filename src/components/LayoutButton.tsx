import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import ELK from "elkjs/lib/elk-api";
import ELKworker from "elkjs/lib/elk-worker.js?worker";
import { LayoutTemplateIcon } from "lucide-react";
import type { INANode, StatementNode } from "@/lib/node";
import { INASEdge, INACEdge } from "@/lib/edge";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { applyLayoutToReactFlow, reactflow2elk } from "@/lib/elk";
import {
  store,
  reset as resetComponentNetwork,
} from "@/stores/component-network";
import { reset as resetStatementNetwork } from "@/stores/statement-network";

const elk = new ELK({
  workerFactory: () => {
    return new ELKworker();
  },
});

// eslint-disable-next-line react-refresh/only-export-components
export const useComponentLayout = () => {
  const { getNodes, getEdges, fitView } = useReactFlow<INANode, INACEdge>();

  const autoLayout = useCallback(() => {
    const state = {
      nodes: getNodes(),
      edges: getEdges(),
    };
    const graph = reactflow2elk(state);

    elk.layout(graph).then((elkNode) => {
      const newState = applyLayoutToReactFlow(elkNode, state);

      store.setState({
        nodes: newState.nodes,
        edges: newState.edges,
      });
      window.requestAnimationFrame(() => {
        fitView();
      });
    });
  }, [fitView, getEdges, getNodes]);

  return autoLayout;
};

// eslint-disable-next-line react-refresh/only-export-components
export function useStatementLayout() {
  const { getNodes, setNodes, getEdges, fitView } = useReactFlow<
    StatementNode,
    INASEdge
  >();
  const getLayoutedElements = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();
    const graph = {
      id: "root",
      layoutOptions: {
        "elk.algorithm": "layered",
        "elk.layered.wrapping.strategy": "MULTI_EDGE",
        "elk.direction": "DOWN",
      },
      children: nodes.map((node) => ({
        ...node,
        width: node.measured!.width,
        height: node.measured!.height,
      })),
      edges,
    };

    // @ts-expect-error copied from react-flow examples
    elk.layout(graph).then(({ children }) => {
      // By mutating the children in-place we saves ourselves from creating a
      // needless copy of the nodes array.
      children!.forEach((node) => {
        // @ts-expect-error copied from react-flow examples
        node.position = { x: node.x, y: node.y };
      });

      // @ts-expect-error copied from react-flow examples
      setNodes(children);
      window.requestAnimationFrame(() => {
        fitView();
      });
    });
  }, [fitView, getEdges, getNodes, setNodes]);

  return getLayoutedElements;
}

export function ComponentLayoutButton() {
  const autoLayout = useComponentLayout();
  return (
    <>
      <DropdownMenuItem onClick={autoLayout} title="Auto layout nodes">
        <LayoutTemplateIcon />
        Auto layout
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => {
          resetComponentNetwork();
        }}
        title="Reset component network"
      >
        <LayoutTemplateIcon /> Reset auto layout
      </DropdownMenuItem>
    </>
  );
}

export function StatementLayoutButton() {
  const autoLayout = useStatementLayout();
  return (
    <>
      <DropdownMenuItem onClick={autoLayout} title="Auto layout nodes">
        <LayoutTemplateIcon />
        Auto layout
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => {
          resetStatementNetwork();
        }}
        title="Reset auto layout"
      >
        <LayoutTemplateIcon /> Reset auto layout
      </DropdownMenuItem>
    </>
  );
}
