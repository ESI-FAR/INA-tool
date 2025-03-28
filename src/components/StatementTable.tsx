import {
  Connection,
  ConnectionComponent,
  deonticSchema,
  Statement,
  statementSchema,
  StatementType,
  TypeOfObject,
} from "@/lib/schema";
import {
  ColumnDef,
  Row,
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
import { useCallback, useMemo, useState } from "react";
import { DataTableColumnHeader } from "./ColumnHeader";
import { DataTablePagination } from "./DataTablePagination";
import { Input } from "./ui/input";
import { DownloadStatementButton } from "./DownloadStatementButton";
import { Button } from "./ui/button";
import {
  PencilIcon,
  PlusIcon,
  SaveIcon,
  TrashIcon,
  Undo2Icon,
} from "lucide-react";
import { ControllerRenderProps, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useStatements } from "../hooks/use-statements";
import { useConnections } from "@/hooks/use-connections";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ButtonWithTooltip } from "./ButtonWithTooltip";
import { Block } from "@tanstack/react-router";

const columns: ColumnDef<Statement>[] = [
  {
    accessorKey: "Id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Id" />
    ),
    meta: {
      editable: false,
    },
  },
  {
    accessorKey: "Statement Type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statement Type" />
    ),
    meta: {
      choices: StatementType.options,
    },
  },
  {
    accessorKey: "Activation Condition",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Activation Condition" />
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
    meta: {
      choices: deonticSchema.options,
    },
  },
  {
    accessorKey: "Aim",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Aim" />
    ),
  },
  {
    accessorKey: "Execution Constraint",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Execution Constraint" />
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
    meta: {
      choices: TypeOfObject.options,
    },
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
    meta: {
      choices: TypeOfObject.options,
    },
  },
  {
    accessorKey: "Or Else",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Or Else" />
    ),
  },
];

export function StatementTable() {
  const { statements, createFreshStatement, deleteStatement, updateStatement } =
    useStatements();
  const { connectionsOfStatement, removeConnections, connectionsOfComponent } =
    useConnections();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  // TODO reset editing when you replace the statements by uploading a file or loading the example
  const [editing, setEditing] = useState<Statement | null>(null);

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
    enableRowSelection: true,
    state: {
      sorting,
      globalFilter,
    },
  });

  function addStatement() {
    const newStatement = createFreshStatement();
    setEditing(newStatement);
  }

  const removeStatement = useCallback(
    (id: string) => {
      // Check statement is unconnected
      const connections = connectionsOfStatement(id);
      if (connections.length > 0) {
        // If statement is connected, ask for confirmation and remove connection as well
        if (
          window.confirm(
            "This statement is connected to other statement(s). Deleting it will also delete those connections. Are you sure you want to delete it?",
          )
        ) {
          removeConnections(connections);
          deleteStatement(id);
        } else {
          // Do nothing
        }
      } else {
        // If statement is unconnected, remove it
        deleteStatement(id);
      }
    },
    [connectionsOfStatement, removeConnections, deleteStatement],
  );

  const onSave = useCallback(
    (tosave: Statement, previous: Statement) => {
      const connections: Connection[] = [];
      // on update, if component became empty then check it is connected or not
      for (const [component, value] of Object.entries(tosave) as [
        keyof Statement,
        unknown,
      ][]) {
        if (value === "" && previous[component]) {
          const componentOfConnection = component as ConnectionComponent;
          connections.push(
            ...connectionsOfComponent(previous.Id, componentOfConnection),
          );
        }
      }
      // if object type is switched then also check for connections as they will be invalid
      if (
        tosave["Type of Direct Object"] !== previous["Type of Direct Object"]
      ) {
        const componentOfConnection = "Direct Object";
        connections.push(
          ...connectionsOfComponent(previous.Id, componentOfConnection),
        );
      }
      if (
        tosave["Type of Indirect Object"] !==
        previous["Type of Indirect Object"]
      ) {
        const componentOfConnection = "Indirect Object";
        connections.push(
          ...connectionsOfComponent(previous.Id, componentOfConnection),
        );
      }
      // If connected then ask for confirmation and remove connection
      if (connections.length > 0) {
        if (
          window.confirm(
            "A component of the statement has been cleared. That component is connected to another statement. Saving will delete those connections. Are you sure you want to save it?",
          )
        ) {
          removeConnections(connections);
          updateStatement(tosave);
        }
      } else {
        updateStatement(tosave);
      }
    },
    [connectionsOfComponent, removeConnections, updateStatement],
  );

  return (
    <div className="w-full">
      <h1 className="text-xl">Statements</h1>
      <div className="flex justify-between gap-4 py-2">
        <Input
          value={globalFilter}
          type="search"
          className="w-64"
          onChange={(e) => table.setGlobalFilter(String(e.target.value))}
          placeholder="Search..."
        />
        <DownloadStatementButton />
      </div>
      {/* TODO show vertical scrollbar if window is too small */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead></TableHead>
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
          <Block
            shouldBlockFn={() => {
              if (!editing) return false;

              const shouldLeave = confirm(
                "You have unsaved changes. Are you sure you want to leave?",
              );
              return !shouldLeave;
            }}
          />
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                if (editing && row.original.Id === editing.Id) {
                  return (
                    <EditRow
                      key={row.id}
                      row={row}
                      onSave={(statement) => {
                        setEditing(null);
                        onSave(statement, row.original);
                      }}
                      onCancel={() => {
                        // When a new statement is added and then cancelled, it should be removed
                        const result = statementSchema.safeParse(row.original);
                        if (!result.success) {
                          removeStatement(row.original.Id);
                        }
                        setEditing(null);
                      }}
                    />
                  );
                }
                return (
                  <ShowRow
                    key={row.id}
                    row={row}
                    setEditing={setEditing}
                    editingId={editing ? editing.Id : undefined}
                    onDelete={() => removeStatement(row.original.Id)}
                  />
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="h-24 text-center text-gray-500"
                >
                  No statements found. Please add statement by using "Add
                  statement" button or upload a file.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between gap-4 py-2">
        <ButtonWithTooltip
          onClick={addStatement}
          disabled={editing !== null}
          tooltip={
            editing
              ? "Please save or cancel the current statement before adding a new one"
              : "Add statement"
          }
        >
          <PlusIcon />
          Add statement
        </ButtonWithTooltip>
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}

function ShowRow({
  row,
  setEditing,
  editingId,
  onDelete,
}: {
  row: Row<Statement>;
  editingId: string | undefined;
  setEditing: (statement: Statement) => void;
  onDelete: () => void;
}) {
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      aria-label={row.original["Id"]}
    >
      <TableCell className="flex gap-1">
        <ButtonWithTooltip
          onClick={() => setEditing(row.original)}
          disabled={editingId !== undefined && row.original["Id"] !== editingId}
          tooltip={
            editingId
              ? "Please save or cancel the current statement before editing another one"
              : "Edit"
          }
          size="icon"
        >
          <PencilIcon />
        </ButtonWithTooltip>
        <Button
          title="Delete"
          aria-label="Delete"
          variant="destructive"
          size="icon"
          onClick={onDelete}
        >
          <TrashIcon />
        </Button>
      </TableCell>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

function FormInput({
  meta,
  field,
}: {
  meta?: { choices?: string[] };
  field: ControllerRenderProps<Statement>;
}) {
  if (!meta || meta.choices === undefined) {
    return <Input {...field} />;
  }
  if (meta.choices.length > 4) {
    // Select can not have empty string as value so we are using 'none' as value for empty string.
    return (
      <Select
        required={false}
        onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
        defaultValue={field.value}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {meta.choices.map((choice) =>
            choice === "" ? (
              <SelectItem key={"none"} value="none">
                &nbsp;
              </SelectItem>
            ) : (
              <SelectItem key={choice} value={choice}>
                {choice}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>
    );
  }

  return (
    <RadioGroup
      onValueChange={field.onChange}
      defaultValue={field.value}
      className="flex flex-col space-y-1"
    >
      {meta.choices.map((choice) => (
        <FormItem
          key={choice}
          className="flex items-center space-x-3 space-y-0"
        >
          <FormControl>
            <RadioGroupItem value={choice} />
          </FormControl>
          <FormLabel className="font-normal">
            {choice === "" ? "none" : choice}
          </FormLabel>
        </FormItem>
      ))}
    </RadioGroup>
  );
}

function EditRow({
  row,
  onSave,
  onCancel,
}: {
  row: Row<Statement>;
  onSave: (statement: Statement) => void;
  onCancel: () => void;
}) {
  const defaultValues = useMemo(
    () => structuredClone(row.original),
    [row.original],
  );
  const myform = useForm<Statement>({
    resolver: zodResolver(statementSchema),
    defaultValues: defaultValues,
  });

  return (
    <TableRow data-state={row.getIsSelected() && "selected"}>
      <TableCell className="flex flex-col gap-1">
        <form onSubmit={myform.handleSubmit(onSave)}>
          <Button
            title="Save"
            aria-label="Save"
            variant="secondary"
            size="icon"
            type="submit"
          >
            <SaveIcon />
          </Button>
        </form>
        <Button
          title="Cancel"
          aria-label="Cancel"
          variant="secondary"
          size="icon"
          onClick={onCancel}
          type="button"
          value="cancel"
        >
          <Undo2Icon />
        </Button>
      </TableCell>
      <FormProvider {...myform}>
        {row.getVisibleCells().map((cell) => {
          const meta = cell.column.columnDef.meta as {
            editable?: boolean;
            choices?: string[];
          };
          if (meta && meta.editable !== undefined && meta.editable === false) {
            return (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            );
          }
          return (
            <TableCell key={cell.id}>
              <FormField
                control={myform.control}
                name={cell.column.id as keyof Statement}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FormInput meta={meta} field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TableCell>
          );
        })}
      </FormProvider>
    </TableRow>
  );
}
