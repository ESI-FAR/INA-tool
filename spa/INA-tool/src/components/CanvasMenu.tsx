import {
  AlignVerticalDistributeCenterIcon,
  CameraIcon,
  LayoutTemplateIcon,
  MenuIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { store } from "@/lib/store";
import { useStore } from "zustand";
import { Legend } from "./CanvasLegendButton";
import { useAutoLayout } from "./LayoutButton";
import { useTakeScreenshot } from "./ScreenshotButton";

export function CanvasMenu() {
  const isDeduplicated = useStore(store, (s) => s.isDeduplicated);
  const setIsDeduplicated = useStore(store, (s) => s.setDeduplicated);
  const isCompact = useStore(store, (s) => s.isCompact);
  const setCompact = useStore(store, (s) => s.setCompact);
  const autoLayout = useAutoLayout();
  const takeScreenshot = useTakeScreenshot();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline">
          <MenuIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={autoLayout}>
            <LayoutTemplateIcon />
            Auto layout
          </DropdownMenuItem>
          <DropdownMenuItem onClick={takeScreenshot}>
            <CameraIcon />
            Screenshot
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <AlignVerticalDistributeCenterIcon />
              Legend
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <Legend />
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuLabel>View</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={isCompact ? "compact" : "normal"}
            onValueChange={(value) => setCompact(value === "compact")}
          >
            <DropdownMenuRadioItem value="compact">
              Compact
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="normal">Normal</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={isDeduplicated}
            onCheckedChange={setIsDeduplicated}
          >
            De-duplicated
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
