import { Statement } from "@/lib/schema";
import { Store, store } from "@/lib/store";
import { useStore } from "zustand/react";
import { shallow, useShallow } from "zustand/shallow";

import {
  ColumnDef,
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
import { deriveStatements } from "@/lib/io";
import { INANode } from "./nodes";

const columns: ColumnDef<Statement>[] = [
  {
    accessorKey: "Id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Id" />
    ),
  },
  {
    accessorKey: "Statement Type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statement Type" />
    ),
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

export function StatementTable() {
  const stripper = useShallow<Store, Statement[]>((state) =>
    deriveStatements(state.nodes),
  );
  const statements = useStore(store, stripper);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
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
    state: {
      sorting,
      globalFilter,
    },
  });
  return (
    <div className="container">
      <h1 className="text-xl">DataTable</h1>
      <div className="flex justify-between gap-4 py-2">
        <Input
          value={globalFilter}
          className="w-64"
          onChange={(e) => table.setGlobalFilter(String(e.target.value))}
          placeholder="Search..."
        />
        <DownloadStatementButton />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
