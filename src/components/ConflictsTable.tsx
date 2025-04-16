import {
  ColumnDef,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { DataTableColumnHeader } from "./ColumnHeader";
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
import { DataTablePagination } from "./DataTablePagination";
import { AddConflictButton } from "./AddConflictButton.tsx";
import { DownloadConflictButton } from "./DownloadConflictButton.tsx";
import { UploadConflictButton } from "./UploadConflictButton.tsx";
import { StatementCell } from "./StatementCell.tsx";
import { searchStatement } from "./search.tsx";
import { DeleteSelectedButton } from "./DeleteSelectedButton.tsx";
import { selectColumnDefinition } from "./selectColumnDefinition.tsx";

const columns: ColumnDef<ConflictWithStatements>[] = [
  selectColumnDefinition(),
  {
    accessorKey: "formal",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Formal statement" />
    ),
    cell: (props) => (
      <StatementCell statement={props.row.original.formalStatement} />
    ),
  },
  {
    accessorKey: "informal",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Informal statement" />
    ),
    cell: (props) => (
      <StatementCell statement={props.row.original.informalStatement} />
    ),
  },
];

const search: FilterFn<ConflictWithStatements> = (row, _, filterValue) => {
  return Boolean(
    searchStatement(filterValue, row.original.formalStatement) ||
      searchStatement(filterValue, row.original.informalStatement),
  );
};

export function ConflictsTable() {
  const { removeConflicts } = useConflicts();
  const conflicts = useConflictsWithStatements();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const table = useReactTable({
    data: conflicts,
    columns,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    globalFilterFn: search,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <h1 className="text-xl">Conflicts</h1>
      <p>
        Mark a formal and an informal statement pair as conflicting with each
        other.
      </p>
      <div className="flex justify-between gap-4 py-2">
        <Input
          value={globalFilter}
          type="search"
          className="w-64"
          onChange={(e) => table.setGlobalFilter(String(e.target.value))}
          placeholder="Search..."
        />
        <div className="flex gap-2">
          <DownloadConflictButton />
          <UploadConflictButton />
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
        <DeleteSelectedButton
          nrSelectedRows={Object.keys(rowSelection).length}
          nrTotalRows={conflicts.length}
          what="conflicts"
          onDelete={() => {
            const toDelete = table
              .getSelectedRowModel()
              .rows.map((row) => row.original);
            removeConflicts(toDelete);
            table.resetRowSelection();
          }}
        />
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
