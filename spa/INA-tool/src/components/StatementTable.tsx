import {
  Statement,
  statementSchema,
  StatementType,
  TypeOfObject,
} from "@/lib/schema";
import { store } from "@/lib/store";

import {
  ColumnDef,
  Row,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMemo, useState } from "react";
import { DataTableColumnHeader } from "./ColumnHeader";
import { DataTablePagination } from "./DataTablePagination";
import { Input } from "./ui/input";
import { DownloadStatementButton } from "./DownloadStatementButton";
import { offsetStatement, procesStatement } from "@/lib/io";
import { isStatementNode } from "@/lib/node";
import { Button } from "./ui/button";
import {
  PencilIcon,
  PlusIcon,
  SaveIcon,
  TrashIcon,
  Undo2Icon,
} from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useStatements } from "../hooks/use-statements";

const columns: ColumnDef<Statement>[] = [
  {
    accessorKey: "Id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Id" />
    ),
    meta: {
      editable: false,
    },
  },
  {
    accessorKey: "Statement Type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statement Type" />
    ),
    meta: {
      choices: StatementType.options,
    },
  },
  {
    accessorKey: "Attribute",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Attribute" />
    ),
  },
  {
    accessorKey: "Deontic",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deontic" />
    ),
  },
  {
    accessorKey: "Aim",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Aim" />
    ),
  },
  {
    accessorKey: "Direct Object",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Direct Object" />
    ),
  },
  {
    accessorKey: "Type of Direct Object",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type Of Direct Object" />
    ),
    meta: {
      choices: TypeOfObject.options,
    },
  },
  {
    accessorKey: "Indirect Object",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Indirect Object" />
    ),
  },
  {
    accessorKey: "Type of Indirect Object",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type Of Indirect Object" />
    ),
    meta: {
      choices: TypeOfObject.options,
    },
  },
  {
    accessorKey: "Activation Condition",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Activation Condition" />
    ),
  },
  {
    accessorKey: "Execution Constraint",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Execution Constraint" />
    ),
  },
  {
    accessorKey: "Or Else",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Or Else" />
    ),
  },
];

function updateStatement(statement: Statement) {
  const id = statement.Id!;
  // Remove nodes and edges belonging to the statement
  const origNodes = store.getState().nodes;
  const oldNodesOfStatement = origNodes.filter(
    (node) => node.id === id || node.parentId === id,
  );
  const oldIdOfNodesOfStatement = new Set(
    oldNodesOfStatement.map((node) => node.id),
  );
  const prunedNodes = origNodes.filter(
    (node) => !oldNodesOfStatement.includes(node),
  );
  const oldStatementNode = oldNodesOfStatement.find((node) => node.id === id);
  const oldEdgesOfStatement = store
    .getState()
    .edges.filter(
      (edge) =>
        oldIdOfNodesOfStatement.has(edge.source) ||
        oldIdOfNodesOfStatement.has(edge.target),
    );
  const prunedEdges = store
    .getState()
    .edges.filter((edge) => !oldEdgesOfStatement.includes(edge));
  // TODO inter statement edges should be kept
  // now we remove all edges belonging to the statement

  // Add new nodes and edges
  const [newNodes, newEdges] = procesStatement(statement, statement.Id!);
  // Retain position and style of the old statement node
  if (oldStatementNode && oldStatementNode.position && oldStatementNode.style) {
    newNodes[0].position = oldStatementNode.position;
    newNodes[0].style = oldStatementNode.style;
  }
  store.getState().setNodes([...newNodes, ...prunedNodes]);
  store.getState().setEdges([...newEdges, ...prunedEdges]);
}

function deleteStatement(id: string) {
  // TODO Ask for confirmation if statement has driven connection edges?
  // Remove nodes
  const ids2remove = new Set(
    store
      .getState()
      .nodes.filter((n) => n.id === id || n.parentId === id)
      .map((n) => n.id),
  );
  store
    .getState()
    .setNodes(store.getState().nodes.filter((n) => !ids2remove.has(n.id)));
  // Remove edges without nodes
  store.getState().setEdges(
    store.getState().edges.filter((e) => {
      return !ids2remove.has(e.source) && !ids2remove.has(e.target);
    }),
  );
}

export function StatementTable() {
  const statements = useStatements();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [editing, setEditing] = useState<Statement | null>(null);

  const table = useReactTable({
    data: statements,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    onGlobalFilterChange: setGlobalFilter,
    enableRowSelection: true,
    state: {
      sorting,
      globalFilter,
    },
  });

  function addStatement() {
    let newId = statements.length;
    // If id already exists, increment until it doesn't
    while (statements.some((s) => s.Id === newId.toString())) {
      newId++;
    }
    const newStatement: Statement = {
      Id: newId.toString(),
      "Statement Type": "",
      Attribute: "",
      Deontic: "",
      Aim: "",
      "Direct Object": "",
      "Type of Direct Object": "",
      "Indirect Object": "",
      "Type of Indirect Object": "",
      "Activation Condition": "",
      "Execution Constraint": "",
      "Or Else": "",
    };
    const [newNodes, newEdges] = procesStatement(newStatement, "new");
    const statementNode = newNodes[0];
    if (isStatementNode(statementNode)) {
      offsetStatement(statementNode, statements.length);
    }
    store.getState().setNodes([...store.getState().nodes, ...newNodes]);
    store.getState().setEdges([...store.getState().edges, ...newEdges]);
    setEditing(newStatement);
  }

  return (
    <div className="w-full">
      <h1 className="text-xl">Statements</h1>
      <div className="flex justify-between gap-4 py-2">
        <Input
          value={globalFilter}
          type="search"
          className="w-64"
          onChange={(e) => table.setGlobalFilter(String(e.target.value))}
          placeholder="Search..."
        />
        <DownloadStatementButton />
      </div>
      {/* TODO show vertical scrollbar if window is too small */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead></TableHead>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                if (editing && row.original.Id === editing.Id) {
                  return (
                    <EditRow
                      key={row.id}
                      row={row}
                      onSave={(statement) => {
                        setEditing(null);
                        updateStatement(statement);
                      }}
                      onCancel={() => setEditing(null)}
                    />
                  );
                }
                return (
                  <ShowRow
                    key={row.id}
                    row={row}
                    setEditing={setEditing}
                    editingId={editing ? editing.Id : undefined}
                    onDelete={() => deleteStatement(row.original.Id!)}
                  />
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between gap-4 py-2">
        <Button variant="secondary" onClick={addStatement}>
          <PlusIcon />
          Add statement
        </Button>
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}

function ShowRow({
  row,
  setEditing,
  editingId,
  onDelete,
}: {
  row: Row<Statement>;
  editingId: string | undefined;
  setEditing: (statement: Statement) => void;
  onDelete: () => void;
}) {
  return (
    <TableRow data-state={row.getIsSelected() && "selected"}>
      <TableCell className="flex gap-1">
        <Button
          disabled={editingId !== undefined && row.original["Id"] !== editingId}
          title="Edit"
          variant="secondary"
          size="icon"
          onClick={() => setEditing(row.original)}
        >
          <PencilIcon />
        </Button>
        <Button
          title="Delete"
          variant="destructive"
          size="icon"
          onClick={onDelete}
        >
          <TrashIcon />
        </Button>
      </TableCell>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

function EditRow({
  row,
  onSave,
  onCancel,
}: {
  row: Row<Statement>;
  onSave: (statement: Statement) => void;
  onCancel: () => void;
}) {
  const defaultValues = useMemo(
    () => structuredClone(row.original),
    [row.original],
  );
  const myform = useForm<Statement>({
    resolver: zodResolver(statementSchema),
    defaultValues: defaultValues,
  });

  return (
    <TableRow data-state={row.getIsSelected() && "selected"}>
      <TableCell className="flex flex-col gap-1">
        <form onSubmit={myform.handleSubmit(onSave)}>
          <Button title="Save" variant="secondary" size="icon" type="submit">
            <SaveIcon />
          </Button>
        </form>
        <Button
          title="Cancel"
          variant="secondary"
          size="icon"
          onClick={onCancel}
          type="button"
          value="cancel"
        >
          <Undo2Icon />
        </Button>
      </TableCell>
      <FormProvider {...myform}>
        {row.getVisibleCells().map((cell) => {
          const meta = cell.column.columnDef.meta as {
            editable?: boolean;
            type?: "select";
            choices?: string[];
          };
          if (meta && meta.editable !== undefined && meta.editable === false) {
            return (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            );
          }
          return (
            <TableCell key={cell.id}>
              <FormField
                control={myform.control}
                name={cell.column.id as keyof Statement}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      {meta && meta.choices ? (
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {meta.choices.map((choice) => (
                            <FormItem
                              key={choice}
                              className="flex items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <RadioGroupItem value={choice} />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {choice === "" ? "none" : choice}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      ) : (
                        <Input {...field} />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TableCell>
          );
        })}
      </FormProvider>
    </TableRow>
  );
}
