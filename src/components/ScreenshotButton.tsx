import { CameraIcon } from "lucide-react";
import { toPng, toSvg } from "html-to-image";
import { store } from "@/stores/global";
import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "./ui/dropdown-menu";
import { useStoreApi } from "@xyflow/react";
import { flushSync } from "react-dom";
import { useIsInteractive } from "@/hooks/use-interactive";

function downloadImage(dataUrl: string, extension: string) {
  const projectName = store.getState().projectName;
  const a = document.createElement("a");

  a.setAttribute("download", `${projectName}.${extension}`);
  a.setAttribute("href", dataUrl);
  a.click();
  a.remove();
}

function getViewportElement() {
  const element = document.querySelector(
    ".react-flow__viewport",
  ) as HTMLElement | null;
  if (!element) {
    throw new Error("Element not found");
  }
  return element;
}

async function exportToSvg() {
  const element = getViewportElement();
  const value = await toSvg(element);
  downloadImage(value, "svg");
}

async function exportToPng() {
  const rootClasses = window.document.documentElement.classList;
  const backgroundColor = rootClasses.contains("dark") ? "black" : "white";
  const element = getViewportElement();
  const value = await toPng(element, {
    backgroundColor,
  });
  downloadImage(value, "png");
}

export function ScreenshotButton() {
  const store = useStoreApi();
  const isInteractive = useIsInteractive();

  async function wrapper(fn: () => void) {
    if (isInteractive) {
      // Use flushSync to make sure the state is updated before taking the screenshot
      flushSync(() =>
        // Make network non-interactive while taking the screenshot,
        // this causes handles and resizer to be hidden
        store.setState({
          nodesDraggable: false,
          nodesConnectable: false,
          elementsSelectable: false,
        }),
      );
      await fn();
      store.setState({
        nodesDraggable: true,
        nodesConnectable: true,
        elementsSelectable: true,
      });
    } else {
      fn();
    }
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger title="Take a screenshot">
        <CameraIcon /> Screenshot
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => wrapper(exportToPng)}>
            PNG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => wrapper(exportToSvg)}>
            SVG
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
