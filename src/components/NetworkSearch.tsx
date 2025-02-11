import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useStore } from "zustand";
import { INANode, StatementNode } from "@/lib/node";
import { ReactFlowInstance, useReactFlow, Node } from "@xyflow/react";
import { INACompactEdge, INAEdge } from "@/lib/edge";
import { isStatementNode } from "@/lib/node";
import { store } from "@/stores/component-network";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Button } from "./ui/button";
import { SearchIcon } from "lucide-react";
import { Statement } from "@/lib/schema";

function searchComponents(query: string, nodes: INANode[]) {
  if (query === "") {
    return [];
  }
  return nodes.filter((node) => {
    return node.data.label.toLowerCase().includes(query.toLowerCase());
  });
}

function zoomToHit(
  node: INANode,
  setCenter: ReactFlowInstance<INANode, INAEdge>["setCenter"],
) {
  if (isStatementNode(node)) {
    return setCenter(node.position.x, node.position.y, { duration: 500 });
  }
  // component node position needs to be added to its parent statement node position
  const statement = store.getState().nodes.find((n) => n.id === node.parentId);
  if (!statement) {
    throw new Error("Statement not found");
  }
  if (node.hidden) {
    // If component node is hidden, zoom to its parent statement node
    const x = statement.position.x;
    const y = statement.position.y;
    return setCenter(x, y, { duration: 500 });
  }
  const x = statement.position.x + node.position.x;
  const y = statement.position.y + node.position.y;
  return setCenter(x, y, { duration: 500 });
}

export function ComponentNetworkSearch() {
  const { setCenter, setNodes } = useReactFlow<INANode, INAEdge>();
  const [query, setQuery] = useState("");
  const nodes = useStore(store, (s) => s.nodes);
  const hits = useMemo(() => searchComponents(query, nodes), [query, nodes]);
  const [open, setOpen] = useState(false);
  return (
    <search>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="searchbox"
            aria-expanded={open}
            className="w-24"
          >
            <SearchIcon />
            Search
          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-h-96 overflow-y-auto">
          <Command shouldFilter={false}>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search ..."
            ></CommandInput>
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {hits.map((node) => (
                  <CommandItem
                    key={node.id}
                    value={node.id}
                    onSelect={() => {
                      zoomToHit(node, setCenter);
                      setQuery("");
                      setNodes(selectNode(node));
                    }}
                  >
                    {node.parentId ? `${node.parentId}: ` : ""}
                    {node.data.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </search>
  );
}

function Hit({ statement, query }: { statement: Statement; query: string }) {
  // TODO not highlight whole statement prop, but only the part that matches the query
  return (
    <p>
      <span>
        {statement["Statement Type"] === "formal" ? "F" : "I"}
        {statement.Id}:{" "}
      </span>
      <span className={statement.Attribute.includes(query) ? "font-bold" : ""}>
        {statement.Attribute}
      </span>{" "}
      <span>{statement.Deontic}</span>{" "}
      <span className={statement.Aim.includes(query) ? "font-bold" : ""}>
        {statement.Aim}
      </span>{" "}
      {statement["Direct Object"] && (
        <>
          <span
            title={statement["Type of Direct Object"]}
            className={
              statement["Direct Object"].includes(query) ? "font-bold" : ""
            }
          >
            {statement["Direct Object"]}
          </span>{" "}
        </>
      )}
      {statement["Indirect Object"] && (
        <>
          <span
            title={statement["Type of Indirect Object"]}
            className={
              statement["Indirect Object"].includes(query) ? "font-bold" : ""
            }
          >
            {statement["Indirect Object"]}
          </span>{" "}
        </>
      )}
      <span
        className={
          statement["Activation Condition"]?.includes(query) ? "font-bold" : ""
        }
      >
        {statement["Activation Condition"]}
      </span>{" "}
      <span
        className={
          statement["Execution Constraint"]?.includes(query) ? "font-bold" : ""
        }
      >
        {statement["Execution Constraint"]}
      </span>
    </p>
  );
}

function searchStatement(query: string, statement: Statement) {
  return (
    statement.Id === query ||
    statement.Attribute.includes(query) ||
    statement.Aim.includes(query) ||
    statement["Activation Condition"]?.includes(query) ||
    statement["Direct Object"]?.includes(query) ||
    statement["Indirect Object"]?.includes(query) ||
    statement["Execution Constraint"]?.includes(query) ||
    statement["Or Else"]?.includes(query)
  );
}

function searchStatements(query: string, nodes: StatementNode[]) {
  if (query === "") {
    return [];
  }
  return nodes.filter((node) => searchStatement(query, node.data.raw));
}

/**
 * Select given node and unselect all other nodes
 */
function selectNode<T extends Node>(hit: T) {
  return (prev: T[]) =>
    prev.map((n) => {
      if (n.id === hit.id) {
        return {
          ...n,
          selected: true,
        };
      }
      if (n.selected) {
        return {
          ...n,
          selected: false,
        };
      }
      return n;
    });
}

export function StatementNetworkSearch() {
  const { setCenter, getNodes, setNodes } = useReactFlow<
    StatementNode,
    INACompactEdge
  >();
  const [query, setQuery] = useState("");
  const nodes = getNodes();
  // TODO should we select nodes of hits?
  const hits = useMemo(() => searchStatements(query, nodes), [query, nodes]);
  const [open, setOpen] = useState(false);
  return (
    <search>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="searchbox"
            aria-expanded={open}
            className="w-24"
          >
            <SearchIcon />
            Search
          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-h-96 overflow-y-auto">
          <Command shouldFilter={false}>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search ..."
            ></CommandInput>
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {hits.map((node) => (
                  <CommandItem
                    key={node.id}
                    value={node.id}
                    onSelect={() => {
                      zoomToHit(node, setCenter);
                      setQuery("");
                      setNodes(selectNode(node));
                    }}
                  >
                    <Hit statement={node.data.raw} query={query} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </search>
  );
}
