import { statementColumns } from "@/lib/schema";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { csvFormat } from "d3-dsv";
import {
  CameraIcon,
  DownloadIcon,
  Maximize2Icon,
  PencilIcon,
  SaveIcon,
  Undo2Icon,
} from "lucide-react";

export const Route = createLazyFileRoute("/help")({
  component: RouteComponent,
});

function useTemplate() {
  const idlessColumns = statementColumns.slice(1);
  const content = csvFormat([], idlessColumns);
  const percentencoded = encodeURIComponent(content);
  const href = `data:text/csv;charset=utf-8,${percentencoded}`;
  // TODO add xlsx template
  return {
    columns: idlessColumns,
    content,
    href,
  };
}

function RouteComponent() {
  const { href, columns } = useTemplate();
  return (
    <main className="w-full">
      <h1 className="text-2xl">Welcome to INA TOOL</h1>
      <h3 className="py-4 text-xl">Sidebar</h3>
      <p>
        Use the sidebar to navigate through the different pages and perform
        global actions.
      </p>

      <h3 className="py-4 text-xl">Upload your file with statements</h3>
      <p>
        You can upload only <i>.csv</i> or <i>.xlsx</i> files. Please, use this{" "}
        <a className="underline" href={href} download="INA-tool-template.csv">
          template
        </a>
        . Alternatively, the file must respect the columns ordering and naming
        described below:
      </p>
      <ol className="list-inside list-decimal">
        {columns.map((col) => (
          <li key={col}>{col}</li>
        ))}
      </ol>

      <h3 className="py-4 text-xl">Download/upload project</h3>
      <ul className="list-inside list-disc">
        <li>
          <strong>Download project:</strong> To download project with
          statements, connections as a JSON document.
        </li>
        <li>
          <strong>Upload file:</strong> To upload a project with statements,
          connections as a JSON document (<i>.json</i> extension).
        </li>
        <li>
          <strong>Load example:</strong> To load an example project with
          statements.
        </li>
      </ul>

      <h3 className="py-4 text-xl">Canvas page</h3>
      <p>
        The{" "}
        <Link className="underline" to="/">
          canvas page
        </Link>{" "}
        visualizes the statements and their connections as a graph network.
      </p>
      <ul className="list-inside list-disc">
        <li>
          <strong>Dragging:</strong> Press left mouse key and start dragging the
          statement or a inner statement node or the canvas.
        </li>
        <li>
          <strong>Zoom:</strong> Use zoom buttons in bottom left to zoom in or
          out. Or use the mouse wheel to zoom in or out. The minimap on the
          bottom right side help you orientate.
        </li>
        <li>
          <strong>Draw inter-statements connection:</strong>
          <ol className="ml-6 list-inside list-decimal">
            <li>Find a node you want to start from.</li>
            <li>
              Press left mouse button on colored circle to start making a
              connection.
            </li>
            <li>
              Drag the mouse to same colored circle and release mouse key. If a
              connection can be made it will snap in place.
            </li>
          </ol>
        </li>
        <li>
          <strong>Layout:</strong> To layout the grap use a layout algorithm use
          the layout button at the top right side on the canvas.
        </li>
        <li>
          <strong>Take screenshot:</strong> Download your canvas as PNG image by
          clicking the{" "}
          <i>
            <CameraIcon className="inline" /> screenshot
          </i>{" "}
          button at the top right side on the canvas.
        </li>
        <li>
          <strong>Resize statement:</strong> The bottom right corner has a{" "}
          <Maximize2Icon /> which can be dragged to resize the statement box.
        </li>
      </ul>

      <h3 className="py-4 text-xl">Statements page</h3>
      <p>
        The{" "}
        <Link className="underline" to="/statements">
          statements page
        </Link>{" "}
        allows you to manage the statements.
      </p>
      <ul className="list-inside list-disc">
        <li>
          <strong>Search:</strong> Write text in the search box to focus on
          specific data subsets.
        </li>
        <li>
          <strong>Sorting:</strong> Click on the column header to sort the data.
          Initially sorted on the Id column.
        </li>
        <li>
          <strong>Paging:</strong> If not all data is displayed, use the paging
          buttons to navigate through the data.
        </li>
        <li>
          <strong>Editing:</strong> Click on the{" "}
          <PencilIcon className="inline" />
          edit button to modify the statement. Press{" "}
          <SaveIcon className="inline" /> button to save or{" "}
          <Undo2Icon className="inline" /> button to cancel the changes.
        </li>
        <li>
          <strong>Download:</strong> Click on the{" "}
          <DownloadIcon className="inline" /> download button to download the
          statements as a CSV file.
        </li>
      </ul>

      <h3 className="py-4 text-xl">Connections page</h3>
      <p>
        The{" "}
        <Link className="underline" to="/connections">
          connections page
        </Link>{" "}
        allows you to view and download the connections between statements.
      </p>

      <h3 className="py-4 text-xl">Support and Discussion</h3>
      <p>
        If you encounter issues not covered here, or you want to share some
        ideas, please open an{" "}
        <a
          className="underline"
          href="https://github.com/ESI-FAR/INA-tool/issues/new"
        >
          issue
        </a>{" "}
        or start a{" "}
        <a
          className="underline"
          href="https://github.com/ESI-FAR/INA-tool/discussions/landing"
        >
          discussion
        </a>{" "}
        on the GitHub repository.
      </p>
    </main>
  );
}
