import { DownloadIcon, MenuIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  exportComponentNetworkToGEXF,
  exportComponentNetworkToGraphml,
} from "@/lib/export";
import { download } from "@/lib/io";
import { store as networkStore } from "@/stores/component-network";
import { store } from "@/stores/global";
import { ComponentLayoutButton, useComponentLayout } from "./LayoutButton";
import { ScreenshotButton } from "./ScreenshotButton";
import { useEffect } from "react";

function exportAsGraphml() {
  const projectName = store.getState().projectName;
  const nodes = networkStore.getState().nodes;
  const edges = networkStore.getState().edges;

  const file = exportComponentNetworkToGraphml(projectName, nodes, edges);
  download(file);
}

function exportAsGexf() {
  const projectName = store.getState().projectName;
  const nodes = networkStore.getState().nodes;
  const edges = networkStore.getState().edges;

  const file = exportComponentNetworkToGEXF(projectName, nodes, edges);
  download(file);
}

export function ComponentNetworkMenu() {
  const autoLayout = useComponentLayout();
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        autoLayout();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [autoLayout]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <MenuIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <ScreenshotButton suffix="component" />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger title="Take a screenshot">
            <DownloadIcon /> Export
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={exportAsGraphml}>
                graphml
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAsGexf}>gexf</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <ComponentLayoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
