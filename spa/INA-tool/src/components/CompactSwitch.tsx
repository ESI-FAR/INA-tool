import { useId } from "react";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { useStore } from "zustand";
import { store } from "@/lib/store";

export function CompactSwitch() {
  const isCompact = useStore(store, (s) => s.isCompact);
  const setCompact = useStore(store, (s) => s.setCompact);
  const id = useId();
  return (
    <div className="flex items-center space-x-2">
      <Switch id={id} checked={isCompact} onCheckedChange={setCompact} />
      <Label htmlFor={id}>Compact</Label>
    </div>
  );
}
