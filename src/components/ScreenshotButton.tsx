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
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger title="Take a screenshot">
        <CameraIcon /> Screenshot
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={exportToPng}>PNG</DropdownMenuItem>
          <DropdownMenuItem onClick={exportToSvg}>SVG</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
