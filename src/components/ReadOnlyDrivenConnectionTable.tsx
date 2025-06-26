import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
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
import { useEffect, useMemo, useState } from "react";
import { DataTableColumnHeader } from "./ColumnHeader";
import { DataTablePagination } from "./DataTablePagination";
import { ConnectionWithValues } from "@/lib/schema";
import { selectColumnDefinition } from "./selectColumnDefinition";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { FilterXIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

const columns: ColumnDef<ConnectionWithValues>[] = [
  selectColumnDefinition(),
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
  statement,
}: {
  statement?: string;
  connections: ConnectionWithValues[];
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const table = useReactTable({
    data: connections,
    columns,
    onRowSelectionChange: setRowSelection,
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
      rowSelection,
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
          {statement && (
            <Button
              asChild
              variant="secondary"
              title={`Showing connections of statement ${statement}`}
            >
              <Link to="/connections">All connections</Link>
            </Button>
          )}
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
                  No connections. Please add one, by presssing button below or
                  by uploading or by creating on a network page.
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

function FilterSelect({
  value,
  onValueChange,
  options,
  placeholder = "any",
  disabled = false,
}: {
  value: string | null | undefined;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <Select
      disabled={disabled}
      onValueChange={onValueChange}
      value={value as unknown as string}
    >
      <SelectTrigger>{value ?? placeholder}</SelectTrigger>
      <SelectContent>
        <SelectItem value={null as unknown as string}>{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Filter({
  column,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  column: Column<any, unknown>;
}) {
  const columnKey = column.id;
  const columnFilterValue = column.getFilterValue();
  const sortedUniqueValues = useMemo(
    () =>
      columnKey.endsWith("_value")
        ? []
        : Array.from(column.getFacetedUniqueValues().keys()).sort(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [column.getFacetedUniqueValues(), columnKey],
  );
  switch (columnKey) {
    case "driven_by":
      return (
        <FilterSelect
          value={columnFilterValue?.toString()}
          onValueChange={column.setFilterValue}
          options={sortedUniqueValues}
        />
      );
    case "source_statement":
    case "target_statement":
      return (
        <FilterSelect
          value={columnFilterValue?.toString()}
          onValueChange={column.setFilterValue}
          options={sortedUniqueValues}
        />
      );
    case "source_component":
    case "target_component":
      return (
        <FilterSelect
          value={columnFilterValue?.toString()}
          onValueChange={column.setFilterValue}
          options={sortedUniqueValues}
          placeholder="Any"
        />
      );
    case "source_value":
    case "target_value":
      return (
        <Input
          className="w-36 rounded border shadow"
          onChange={(e) => column.setFilterValue(e.target.value)}
          placeholder={`Search...`}
          type="search"
          value={(columnFilterValue ?? "") as string}
        />
      );
    default:
      return null;
  }
}
