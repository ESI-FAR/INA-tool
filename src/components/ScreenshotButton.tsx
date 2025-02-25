import { CameraIcon } from "lucide-react";
import { useCallback } from "react";
import {
  getNodesBounds,
  getViewportForBounds,
  useReactFlow,
} from "@xyflow/react";
import { toPng } from "html-to-image";
import { store } from "@/stores/global";
import { DropdownMenuItem } from "./ui/dropdown-menu";

function downloadImage(dataUrl: string) {
  const projectName = store.getState().projectName;
  const a = document.createElement("a");

  a.setAttribute("download", `${projectName}.png`);
  a.setAttribute("href", dataUrl);
  a.click();
  a.remove();
}

const imageWidth = 1920;
const imageHeight = 1080;

export function ScreenshotButton() {
  const { getNodes } = useReactFlow();
  const onClick = useCallback(() => {
    const nodesBounds = getNodesBounds(getNodes());
    const viewport = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2,
      0,
    );
    const element = document.querySelector(
      ".react-flow__viewport",
    ) as HTMLElement | null;
    if (!element) {
      console.error("Element not found");
      return;
    }
    toPng(element, {
      backgroundColor: "white",
      width: imageWidth,
      height: imageHeight,
      style: {
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    }).then(downloadImage);
  }, [getNodes]);

  return (
    <DropdownMenuItem onClick={onClick} title="Take a screenshot">
      <CameraIcon /> Screenshot
    </DropdownMenuItem>
  );
}
