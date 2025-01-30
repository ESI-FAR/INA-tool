import { useId } from "react";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

export function CompactSwitch({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center space-x-2">
      <Switch id={id} checked={value} onCheckedChange={onChange} />
      <Label htmlFor={id}>Compact</Label>
    </div>
  );
}
