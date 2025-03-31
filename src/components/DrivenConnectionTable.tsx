import {
  ColumnDef,
  RowSelectionState,
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
import { useState } from "react";
import { DataTableColumnHeader } from "./ColumnHeader";
import { DataTablePagination } from "./DataTablePagination";
import { Input } from "./ui/input";
import { DownloadConnectionButton } from "./DownloadConnectionButton";
import { UploadConnectionButton } from "./UploadConnectionButton";
import { Connection } from "@/lib/schema";
import { AddConnectionButton } from "./AddConnectionButton";
import {
  useConnections,
  useConnectionsWithValues,
} from "@/hooks/use-connections";
import { selectColumnDefinition } from "./selectColumnDefinition";
import { DeleteSelectedButton } from "./DeleteSelectedButton";

const columns: ColumnDef<Connection>[] = [
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
      },
    ],
  },
];

export function DrivenConnectionTable() {
  const { removeConnections } = useConnections();
  const connections = useConnectionsWithValues();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const table = useReactTable({
    data: connections,
    columns,
    onRowSelectionChange: setRowSelection,
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
      rowSelection,
    },
  });

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
        <AddConnectionButton />
        <DeleteSelectedButton
          nrSelectedRows={Object.keys(rowSelection).length}
          nrTotalRows={connections.length}
          what="connections"
          onDelete={() => {
            const toDelete = table
              .getSelectedRowModel()
              .rows.map((row) => row.original);
            removeConnections(toDelete);
            table.resetRowSelection();
          }}
        />
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
