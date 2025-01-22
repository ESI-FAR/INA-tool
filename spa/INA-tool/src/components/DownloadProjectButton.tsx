import { DownloadCloudIcon } from "lucide-react";
import { Button } from "./ui/button";
import { download } from "@/lib/io";
import { store } from "@/lib/store";

function createProjectFile() {
  const projectName = store.getState().projectName;
  const fn = projectName ? `${projectName}.json` : "INA-tool.json";
  const body = {
    nodes: store.getState().nodes,
    edges: store.getState().edges,
  };
  const content = JSON.stringify(body, null, 2);
  return new File([content], fn, { type: "application/json" });
}

function downloadProject() {
  const file = createProjectFile();
  download(file);
}

export function DownloadProjectButton() {
  return (
    <Button variant="outline" onClick={downloadProject}>
      <DownloadCloudIcon />
      <span>Download project</span>
    </Button>
  );
}
