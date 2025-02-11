import { useId, useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { ConnectionWithValues } from "@/lib/schema";

/**
 * In compact mode you can not see to which inner statement component an edge is connected.
 * This component allows the user to pick the source of the connection.
 */
export function SourcePicker({
  choices,
  onPick,
  onCancel,
}: {
  choices: ConnectionWithValues[];
  onPick: (connection: ConnectionWithValues) => void;
  onCancel: () => void;
}) {
  const [open, setOpen] = useState(true);
  const id = useId();

  function onOpenChange(open: boolean) {
    if (!open) {
      onCancel();
    }
    setOpen(open);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="text-xl">Ambigous connection</DialogTitle>
        <DialogDescription>
          The source of the connection is ambiguous. Please select one.
        </DialogDescription>
        <RadioGroup
          onValueChange={(value) => {
            setOpen(false);
            const index = parseInt(value);
            onPick(choices[index]);
          }}
        >
          {choices.map((choice, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={index.toString()} id={id + index} />
              <Label htmlFor={id + index}>
                {choice.source_component}: {choice.source_value}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </DialogContent>
    </Dialog>
  );
}
