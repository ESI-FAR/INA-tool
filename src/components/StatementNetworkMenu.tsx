import { DownloadIcon, MenuIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { exportStatementNetworkToGraphml } from "@/lib/export";
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

export function StatementNetworkMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <MenuIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <ScreenshotButton />
        <StatementLayoutButton />
        <DropdownMenuItem onClick={exportAsGraphml}>
          <DownloadIcon />
          Export as graphml
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
