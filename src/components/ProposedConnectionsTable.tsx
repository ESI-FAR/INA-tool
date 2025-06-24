import type { Connection } from "@/lib/schema";
import {
  TableHeader,
  TableRow,
  TableHead,
  Table,
  TableBody,
  TableCell,
} from "./ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "./ui/button";
import {
  ConnectionWithStatementObjects,
  useConnections,
  useConnectionWithStatementObjects,
} from "@/hooks/use-connections";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import { StatementCell } from "./StatementCell";
import { connection2id } from "@/lib/connectionHelpers";
import { DataTableColumnHeader } from "./ColumnHeader";
import { statementLabel } from "@/lib/utils";

const sortByEndpoint =
  (
    statementKey: "source_statement_object" | "target_statement_object",
    componentKey: "source_component" | "target_component",
  ) =>
  (
    rowA: Row<ConnectionWithStatementObjects>,
    rowB: Row<ConnectionWithStatementObjects>,
  ) => {
    const a =
      statementLabel(rowA.original[statementKey]) +
      " " +
      rowA.original[componentKey];
    const b =
      statementLabel(rowB.original[statementKey]) +
      " " +
      rowB.original[componentKey];
    return a.localeCompare(b);
  };

const columns: ColumnDef<ConnectionWithStatementObjects>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select connection"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "driven_by",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Driven by" />
    ),
  },
  {
    accessorKey: "source_statement",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Source" />
    ),
    cell: (props) => (
      <StatementCell
        statement={props.row.original.source_statement_object}
        highlight={props.row.original.source_component}
      />
    ),
    sortingFn: sortByEndpoint("source_statement_object", "source_component"),
  },
  {
    accessorKey: "target_statement",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Target" />
    ),
    cell: (props) => (
      <StatementCell
        statement={props.row.original.target_statement_object}
        highlight={props.row.original.target_component}
      />
    ),
    sortingFn: sortByEndpoint("target_statement_object", "target_component"),
  },
];

function rowToConnection(row: Row<ConnectionWithStatementObjects>): Connection {
  return {
    driven_by: row.original.driven_by,
    source_statement: row.original.source_statement,
    source_component: row.original.source_component,
    target_statement: row.original.target_statement,
    target_component: row.original.target_component,
  };
}

export function ProposeConnectionsTable({
  connections,
}: {
  connections: Connection[];
}) {
  const { addConnections } = useConnections();
  const data = useConnectionWithStatementObjects(connections);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const init = data.reduce((acc: Record<string, boolean>, connection) => {
      acc[connection2id(connection)] = true;
      return acc;
    }, {});
    setRowSelection(init);
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    getRowId: connection2id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  const addSelected = useCallback(() => {
    const selectedConnections = table
      .getSelectedRowModel()
      .rows.map(rowToConnection);

    addConnections(selectedConnections);
    setRowSelection({});
  }, [addConnections, table]);

  return (
    <div>
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No connections found. Press find button or all connections are
                already present or no statements are available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Button
        onClick={addSelected}
        className="mt-8"
        disabled={table.getFilteredSelectedRowModel().rows.length === 0}
      >
        Add {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} connections
      </Button>
    </div>
  );
}
