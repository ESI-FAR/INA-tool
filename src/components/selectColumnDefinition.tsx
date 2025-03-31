import { Checkbox } from "./ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";

/**
 * Tanstack Table column definition to select rows.
 * 
 * @see https://ui.shadcn.com/docs/components/data-table#update-column-definitions
 * @returns A column definition for a checkbox column in a table.
 */
export function selectColumnDefinition<T>() {
  const def: ColumnDef<T> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        disabled={table.getRowCount() === 0}
        checked={
          table.getIsAllRowsSelected() ||
          (table.getIsSomeRowsSelected() && "indeterminate")
        }
        onCheckedChange={() => table.toggleAllRowsSelected()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select"
        checked={row.getIsSelected()}
        onCheckedChange={row.getToggleSelectedHandler()}
      />
    ),
  };
  return def;
}
