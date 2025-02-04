import {
  DriverType,
  SourceNodeType,
  statementColumns,
  TargetNodeType,
} from "@/lib/schema";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { csvFormat } from "d3-dsv";
import {
  CameraIcon,
  DownloadIcon,
  Maximize2Icon,
  PanelLeft,
  PencilIcon,
  PlusIcon,
  SaveIcon,
  TrashIcon,
  Undo2Icon,
  UploadIcon,
} from "lucide-react";
import screenshot from "../help/canvas.png";

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

      <h3 className="py-4 text-xl">Header</h3>
      <ul className="list-inside list-disc">
        <li>
          Use <PanelLeft className="inline" /> to hide the sidebar.
        </li>
        <li>
          The middle text is the project name. You can rename the project by
          clicking it.
        </li>
        <li>Use right button to toggle between light and dark mode.</li>
      </ul>

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
      <p>
        Any existing statements will be deleted and replaced by the uploaded
        statements.
      </p>
      <h3 className="py-4 text-xl">Upload your file with connections</h3>
      <p>
        On the{" "}
        <Link className="underline" to="/connections">
          connections page
        </Link>{" "}
        you can upload a CSV or XLSX file with connections. The file must
        respect the columns ordering and naming described below:
        <ol className="list-inside list-decimal">
          <li>Source statement, id of source statement</li>
          <li>
            Source node type, must be one of{" "}
            {SourceNodeType.options.map((o) => `"${o}"`).join(", ")}
          </li>
          <li>Source value, the value of the node. Can be empty.</li>
          <li>Target statement, id of target statement</li>
          <li>
            Target node type, must be one of{" "}
            {TargetNodeType.options.map((o) => `"${o}"`).join(", ")}
          </li>
          <li>
            Driver, must be one of{" "}
            {DriverType.options.map((o) => `"${o}"`).join(", ")}
          </li>
        </ol>
      </p>

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
          statements.{" "}
          <a href={screenshot} target="_blank" className="underline">
            Screenshot
          </a>{" "}
          of web application with example loaded.
        </li>
        <li>
          <strong>Clear:</strong>To delete all statements and connections after
          confirmation.
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
          <strong>Compact:</strong> To compact the graph use the compact switch.
          This will render a statement as a single node. Useful for large
          graphs.
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
          <Maximize2Icon className="inline" /> which can be dragged to resize
          the statement box.
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
          <strong>Search:</strong> Write text in the search box to search for
          statements containing the query.
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
          <strong>Deleting:</strong> A statement can be deleted by pressing the{" "}
          <TrashIcon className="inline" /> button. Any connections to or from
          this statement will also be deleted.
        </li>
        <li>
          <strong>Adding:</strong> After pressing the{" "}
          <PlusIcon className="inline" /> button, a new statement will be added
          to the list. Fill in the fields and press the{" "}
          <SaveIcon className="inline" /> button to save the new statement.
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
        <ul className="list-inside list-disc">
          <li>
            <strong>Search:</strong> Write text in the search box to search for
            statements containing the query.
          </li>
          <li>
            <strong>Sorting:</strong> Click on the column header to sort the
            data. Initially sorted on the Id column.
          </li>
          <li>
            <strong>Paging:</strong> If not all data is displayed, use the
            paging buttons to navigate through the data.
          </li>
          <li>
            <strong>Deleting:</strong> A connection can be deleted by pressing
            the <TrashIcon className="inline" /> button.
          </li>
          <li>
            <strong>Adding:</strong> After pressing the{" "}
            <PlusIcon className="inline" /> button, a dialog will open where you
            can select the driver, source and target statements. Press the{" "}
            <SaveIcon className="inline" /> button to save the new connection.
          </li>
          <li>
            <strong>Editing:</strong> There is no edit functionality for
            connections. Delete and add a new connection instead.
          </li>
          <li>
            <strong>Download:</strong> Click on the{" "}
            <DownloadIcon className="inline" /> download button to download the
            connections as a CSV file.
          </li>
          <li>
            <strong>Upload:</strong> Click on the{" "}
            <UploadIcon className="inline" /> upload button to upload a CSV or
            XLSX file with connections. Existing connections will be deleted and
            replaced by the uploaded connections.
          </li>
        </ul>
      </p>

      <h3 className="py-4 text-xl">Persistence</h3>
      <ul className="list-inside list-disc">
        <li>
          The project can be save to a file and loaded from a file. Share the
          file so the reciever can have the same data as you.
        </li>
        <li>
          When you close the web application, the web browser stores the session
          internally. Opening the web application again will restore the
          session.
        </li>
        <li>
          Each project will stored by its name. You can have different projects
          in different web browser tabs open.
        </li>
      </ul>

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
