import { TrashIcon } from "lucide-react";
import { Button } from "./ui/button";

export function DeleteSelectedButton({
  nrTotalRows,
  nrSelectedRows,
  what,
  onDelete,
}: {
  nrTotalRows: number;
  nrSelectedRows: number;
  what: string;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        className="text-destructive"
        size="icon"
        title="Delete selected"
        disabled={!nrTotalRows || !nrSelectedRows}
        onClick={() => {
          if (nrSelectedRows >= 1 && nrTotalRows >= 1) {
            if (
              !window.confirm(
                `Are you sure you want to delete ${nrSelectedRows} ${what}?`,
              )
            ) {
              return;
            }
            onDelete();
          }
        }}
      >
        <TrashIcon />
      </Button>
      <span>
        {nrSelectedRows} of {nrTotalRows} selected
      </span>
    </div>
  );
}
