import {
  DownloadIcon,
  FlaskConicalIcon,
  MenuIcon,
  RouteIcon,
  RouteOffIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
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
import { StatementLayoutButton, useStatementLayout } from "./LayoutButton";
import { ScreenshotButton } from "./ScreenshotButton";
import { useEffect } from "react";
import { toast } from "sonner";
import { useReactFlow } from "@xyflow/react";
import {
  reRouteConnections,
  undoReroutedConnections,
} from "@/lib/reroute/statement";
import { Link } from "@tanstack/react-router";

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
  const reactFlow = useReactFlow();
  const autoLayout = useStatementLayout();
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        reRouteConnections(reactFlow);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reactFlow]);
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
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FlaskConicalIcon />
            Experimental
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem asChild>
                <Link to="/help" hash="experimental-statement">
                  Please read help for usage
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <StatementLayoutButton />
              <DropdownMenuItem
                onClick={() => {
                  toast.promise(reRouteConnections(reactFlow), {
                    loading: "Rerouting connections...",
                    success: "Connections rerouted",
                    error: (err) => {
                      console.error(err);
                      return "Error rerouting connections";
                    },
                  });
                }}
              >
                <RouteIcon />
                Re-route connections
              </DropdownMenuItem>
              <DropdownMenuItem onClick={undoReroutedConnections}>
                <RouteOffIcon />
                Undo rerouted connections
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
