import { CameraIcon } from "lucide-react";
import { toBlob } from "html-to-image";
import { saveAs } from "file-saver";
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

function getViewportElement() {
  const element = document.querySelector(
    ".react-flow__viewport",
  ) as HTMLElement | null;
  if (!element) {
    throw new Error("Element not found");
  }
  return element;
}

async function viewport2png(scale: number, suffix: string) {
  const rootClasses = window.document.documentElement.classList;
  const backgroundColor = rootClasses.contains("dark") ? "black" : "white";
  const element = getViewportElement();
  const blob = await toBlob(element, {
    backgroundColor,
    canvasWidth: element.clientWidth * scale,
    canvasHeight: element.clientHeight * scale,
  });
  if (!blob) {
    throw new Error("Failed to create blob");
  }
  const projectName = store.getState().projectName;
  const fn = `${projectName}.${suffix}.x${scale}.png`;
  const file = new File([blob], fn, { type: "image/png" });
  saveAs(file);
}

export function ScreenshotButton({ suffix }: { suffix: string }) {
  const store = useStoreApi();
  const isInteractive = useIsInteractive();

  async function exportToPng(scale = 1) {
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
      await viewport2png(scale, suffix);
      store.setState({
        nodesDraggable: true,
        nodesConnectable: true,
        elementsSelectable: true,
      });
    } else {
      viewport2png(scale, suffix);
    }
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger title="Take a screenshot">
        <CameraIcon /> Screenshot
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => exportToPng(1)}>
            Original Size (1x)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportToPng(2)}>
            Double Size (2x)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportToPng(4)}>
            Quadruple Size (4x)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportToPng(8)}>
            Octuple Size (8x)
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
