import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
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
import { useEffect, useState } from "react";
import { DataTableColumnHeader } from "./ColumnHeader";
import { DataTablePagination } from "./DataTablePagination";
import { ConnectionWithValues } from "@/lib/schema";
import { Button } from "./ui/button";
import { FilterXIcon } from "lucide-react";
import { Filter } from "./DrivenConnectionTable";

const columns: ColumnDef<ConnectionWithValues>[] = [
  {
    accessorKey: "driven_by",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Driven by" />
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
        accessorKey: "source_component",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Component" />
        ),
      },
      {
        accessorKey: "source_value",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Value" />
        ),
        filterFn: "includesString",
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
        accessorKey: "target_component",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Component" />
        ),
      },
      {
        accessorKey: "target_value",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Value" />
        ),
        filterFn: "includesString",
      },
    ],
  },
];

export function ReadOnlyDrivenConnectionTable({
  connections,
}: {
  connections: ConnectionWithValues[];
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: connections,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      columnFilters,
    },
  });

  useEffect(() => {
    if (connections.length === 0) {
      table.resetColumnFilters();
    }
  }, [connections.length, table]);

  return (
    <div className="w-full">
      <div className="flex justify-between gap-4 py-2">
        <div className="flex gap-2">
          <Button
            onClick={() => table.resetColumnFilters()}
            variant="secondary"
            disabled={Object.keys(columnFilters).length === 0}
          >
            <FilterXIcon />
            Clear filters
          </Button>
        </div>
      </div>
      <div className="w-full rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {header.column.getCanFilter() ? (
                            <div className="pb-1">
                              <Filter column={header.column} />
                            </div>
                          ) : null}
                        </>
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
                  colSpan={7}
                  className="h-24 text-center text-gray-500"
                >
                  No connections. Please add one, by pressing button below or by
                  uploading or by creating on a network page.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between gap-4 py-2">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
