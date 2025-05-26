import { DownloadIcon } from "lucide-react";
import { Button } from "./ui/button";
import { store } from "@/stores/global.ts";
import { download } from "@/lib/io.ts";

function downloadJsonFile() {
  const data = store.getState().conflicts.map((c) => ({
    group: c.group,
    // JSON stringy can not handle Set, so convert to array
    statements: Array.from(c.statements),
  }));
  const content = JSON.stringify(data, undefined, 2);
  const projectName = store.getState().projectName;
  const fn = projectName
    ? `${projectName}.conflicts.json`
    : "INA-tool.conflicts.json";
  const file = new File([content], fn, { type: "application/json" });
  download(file);
}

export function DownloadConflictButton() {
  return (
    <Button variant="outline" onClick={downloadJsonFile}>
      <DownloadIcon />
      Download
    </Button>
  );
}
