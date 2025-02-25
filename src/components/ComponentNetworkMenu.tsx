import { DownloadIcon, MenuIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { ComponentLayoutButton } from "./LayoutButton";
import { ScreenshotButton } from "./ScreenshotButton";

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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <MenuIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <ScreenshotButton />
        <ComponentLayoutButton />
        <DropdownMenuItem onClick={exportAsGraphml}>
          <DownloadIcon />
          Export as graphml
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsGexf}>
          <DownloadIcon />
          Export as gexf
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
