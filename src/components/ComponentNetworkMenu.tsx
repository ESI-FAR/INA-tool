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
import {
  reRouteConnections,
  undoReroutedConnections,
} from "@/lib/reroute/component";
import { useReactFlow } from "@xyflow/react";
import { toast } from "sonner";

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
  const reactFlow = useReactFlow();
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
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FlaskConicalIcon />
            Experimental
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <ComponentLayoutButton />
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
