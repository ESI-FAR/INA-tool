import { DownloadIcon } from "lucide-react";
import { Button } from "./ui/button";
import { download } from "@/lib/io";
import { project2json } from "@/lib/project2json";
import { store } from "@/stores/global";

function createProjectFile() {
  const projectName = store.getState().projectName;
  const fn = projectName ? `${projectName}.json` : "INA-tool.json";
  const content = project2json();
  return new File([content], fn, { type: "application/json" });
}

function downloadProject() {
  const file = createProjectFile();
  download(file);
}

export function DownloadProjectButton() {
  // TODO download in standard graph format so it can be viewed in CytoScape or Gephi.
  // TODO download in semantic web format so it can be viewed in Protege or OntoGraf.
  return (
    <Button variant="outline" onClick={downloadProject}>
      <DownloadIcon />
      <span>Download project</span>
    </Button>
  );
}
