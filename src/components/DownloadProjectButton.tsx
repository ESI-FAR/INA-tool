import { DownloadIcon } from "lucide-react";
import { Button } from "./ui/button";
import { download } from "@/lib/io";
import { store } from "@/lib/store";
import { store as componentGraphStore } from "@/lib/graph-store/component";
import { store as statementGraphStore } from "@/lib/graph-store/statement";

function createProjectFile() {
  const projectName = store.getState().projectName;
  const fn = projectName ? `${projectName}.json` : "INA-tool.json";
  const body = {
    statements: store.getState().statements,
    connections: store.getState().connections,
    conflicts: store.getState().conflicts,
    graph: {
      component: {
        nodes: componentGraphStore.getState().nodes,
        edges: componentGraphStore.getState().edges,
      },
      statement: {
        nodes: statementGraphStore.getState().nodes,
        edges: statementGraphStore.getState().edges,
      },
    },
  };
  const content = JSON.stringify(body, null, 2);
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
