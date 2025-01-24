import { DownloadIcon } from "lucide-react";
import { Button } from "./ui/button";
import { buildProjectJson, download } from "@/lib/io";
import { getProject } from "@/hooks/useProjectName";

function createProjectFile() {
  const projectName = getProject()
  const fn = projectName ? `${projectName}.json` : "INA-tool.json";
  const content= buildProjectJson();
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
