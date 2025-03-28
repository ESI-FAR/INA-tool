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
  exportStatementNetworkToGEXF,
  exportStatementNetworkToGraphml,
} from "@/lib/export";
import { download } from "@/lib/io";
import { store as networkStore } from "@/stores/statement-network";
import { store } from "@/stores/global";
import { StatementLayoutButton } from "./LayoutButton";
import { ScreenshotButton } from "./ScreenshotButton";

function exportAsGraphml() {
  const projectName = store.getState().projectName;
  const nodes = networkStore.getState().nodes;
  const edges = networkStore.getState().edges;

  const file = exportStatementNetworkToGraphml(projectName, nodes, edges);
  download(file);
}

function exportAsGexf() {
  const projectName = store.getState().projectName;
  const nodes = networkStore.getState().nodes;
  const edges = networkStore.getState().edges;

  const file = exportStatementNetworkToGEXF(projectName, nodes, edges);
  download(file);
}

export function StatementNetworkMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <MenuIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <ScreenshotButton suffix="statement" />
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
        <StatementLayoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
