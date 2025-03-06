import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { DataTableColumnHeader } from "./ColumnHeader";
import { StatementCard } from "./StatementCard";
import {
  ConflictWithStatements,
  useConflicts,
  useConflictsWithStatements,
} from "@/hooks/use-conflicts";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { TrashIcon } from "lucide-react";
import { Button } from "./ui/button";
import { DataTablePagination } from "./DataTablePagination";
import { AddConflictButton } from "./AddConflictButton.tsx";

const columns: ColumnDef<ConflictWithStatements>[] = [
  {
    accessorKey: "formal",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Formal statement" />
    ),
    cell: (props) => (
      <StatementCard
        statement={props.row.original.formalStatement}
        className="w-full bg-inherit shadow-none"
      />
    ),
  },
  {
    accessorKey: "informal",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Informal statement" />
    ),
    cell: (props) => (
      <StatementCard
        statement={props.row.original.informalStatement}
        className="w-full bg-inherit shadow-none"
      />
    ),
  },
];

export function ConflictsTable() {
  const { removeConflicts } = useConflicts();
  const conflicts = useConflictsWithStatements();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const table = useReactTable({
    data: conflicts,
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
      <h1 className="text-xl">Conflicts</h1>
      <div className="flex justify-between gap-4 py-2">
        <Input
          value={globalFilter}
          type="search"
          className="w-64"
          onChange={(e) => table.setGlobalFilter(String(e.target.value))}
          placeholder="Search..."
        />
        {/* TODO add download and upload buttons, file should use statement ids */}
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
                      onClick={() => removeConflicts([row.original])}
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
                  colSpan={7}
                  className="h-24 text-center text-gray-500"
                >
                  No conflicts. Please add one, by presssing button below or by
                  uploading or by creating on a network page.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between gap-4 py-2">
        <AddConflictButton />
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
