import { store } from "@/lib/store";
import { useStore } from "zustand/react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
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
import { deriveConnections } from "@/lib/io";
import { DownloadConnectionButton } from "./DownloadConnectionButton";
import { UploadConnectionButton } from "./UploadConnectionButton";
import { Connection } from "@/lib/schema";
import { TrashIcon } from "lucide-react";
import { Button } from "./ui/button";
import { AddConnectionButton } from "./AddConnectionButton";

const columns: ColumnDef<Connection>[] = [
  {
    accessorKey: "driver",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Driver" />
    ),
  },
  {
    header: "Source",
    columns: [
      {
        accessorKey: "source_statement",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Statement" />
        ),
      },
      {
        accessorKey: "source_node",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Node" />
        ),
      },
      {
        accessorKey: "source_value",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Value" />
        ),
      },
    ],
  },
  {
    header: "Target",
    columns: [
      {
        accessorKey: "target_statement",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Statement" />
        ),
      },
      {
        accessorKey: "target_node",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Node" />
        ),
      },
      {
        accessorKey: "target_value",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Value" />
        ),
      },
    ],
  },
];

export function DrivenConnectionTable() {
  const edges = useStore(store, (state) => state.edges);
  const nodes = useStore(store, (state) => state.nodes);
  const connections = useMemo(
    () => deriveConnections(edges, nodes),
    [edges, nodes],
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const table = useReactTable({
    data: connections,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    globalFilterFn: "includesString",
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  });

  function removeConnection(connection: Connection) {
    const id =
      connection.source_statement +
      "-" +
      connection.source_node +
      "-2-" +
      connection.target_statement +
      "-" +
      connection.target_node;
    const newEdges = edges.filter((edge) => edge.id !== id);
    store.getState().setEdges(newEdges);
  }

  return (
    <div className="w-full">
      <h1 className="text-xl">Connections</h1>
      <div className="flex justify-between gap-4 py-2">
        <Input
          value={globalFilter}
          type="search"
          className="w-64"
          onChange={(e) => table.setGlobalFilter(String(e.target.value))}
          placeholder="Search..."
        />
        <div className="flex gap-2">
          <DownloadConnectionButton />
          <UploadConnectionButton />
        </div>
      </div>
      <div className="w-full rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead></TableHead>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeConnection(row.original)}
                    >
                      <TrashIcon />
                    </Button>
                  </TableCell>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
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
        <AddConnectionButton />
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
