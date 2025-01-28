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
import { deriveConnections, EnrichedDrivenConnection } from "@/lib/io";
import { DownloadConnectionButton } from "./DownloadConnectionButton";

const columns: ColumnDef<EnrichedDrivenConnection>[] = [
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
        accessorKey: "source.value",
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
  return (
    <div className="w-full">
      <h1 className="text-xl">Connections</h1>
      <div className="flex justify-between gap-4 py-2">
        <Input
          value={globalFilter}
          className="w-64"
          onChange={(e) => table.setGlobalFilter(String(e.target.value))}
          placeholder="Search..."
        />
        <DownloadConnectionButton />
      </div>
      <div className="w-full rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
      <DataTablePagination table={table} />
    </div>
  );
}
