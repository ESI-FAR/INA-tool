import { Statement } from "@/lib/schema";
import { store } from "@/store";
import { useStore } from "zustand/react";
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
import { useState } from "react";
import { DataTableColumnHeader } from "./ColumnHeader";
import { DataTablePagination } from "./DataTablePagination";
import { Input } from "./ui/input";
import { DownloadStatementButton } from "./DownloadStatementButton";

export const columns: ColumnDef<Statement>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Id" />
    ),
  },
  {
    accessorKey: "statementType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statement Type" />
    ),
  },
  {
    accessorKey: "attribute",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Attribute" />
    ),
  },
  {
    accessorKey: "deontic",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deontic" />
    ),
  },
  {
    accessorKey: "aim",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Aim" />
    ),
  },
  {
    accessorKey: "directObject",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Direct Object" />
    ),
  },
  {
    accessorKey: "typeOfDirectObject",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type Of Direct Object" />
    ),
  },
  {
    accessorKey: "indirectObject",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Indirect Object" />
    ),
  },
  {
    accessorKey: "typeOfIndirectObject",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type Of Indirect Object" />
    ),
  },
  {
    accessorKey: "activationCondition",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Activation Condition" />
    ),
  },
  {
    accessorKey: "executionConstraint",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Execution Constraint" />
    ),
  },
  {
    accessorKey: "orElse",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Or Else" />
    ),
  },
];

export function StatementTable() {
  const statements = useStore(store, (state) => state.statements);
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
