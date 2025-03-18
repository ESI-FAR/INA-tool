import {
  drivenbySchema,
  SourceComponentSchema,
  statementColumns,
  TargetComponentSchema,
} from "@/lib/schema";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import {
  AlignVerticalDistributeCenterIcon,
  CameraIcon,
  DownloadIcon,
  LayoutTemplateIcon,
  Maximize2Icon,
  MenuIcon,
  PanelLeft,
  PencilIcon,
  PlusIcon,
  SaveIcon,
  SearchIcon,
  TrashIcon,
  Undo2Icon,
  UploadIcon,
} from "lucide-react";
import screenshot from "../help/network.png";
import templatexlsx from "../help/Institutional_statement_template.xlsx?url";

export const Route = createLazyFileRoute("/help")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="w-full">
      <h1 className="text-2xl">
        Welcome to Institutional Network Analyis (INA) tool
      </h1>

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
        You can upload comma-separated (.csv) or Excel (.xlsx) file. Please, use
        this{" "}
        <a
          className="underline"
          href={templatexlsx}
          download="Institutional_statement_template.xlsx"
        >
          template
        </a>
        . Alternatively, the file must respect the column naming described
        below:
      </p>
      <ol className="list-inside list-decimal">
        {statementColumns.map((col) => (
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
        you can upload a comma-separated (.csv) or Excel (.xlsx) file with
        connections. The file must respect the columns ordering and naming
        described below:
        <ol className="list-inside list-decimal">
          <li>"source_statement", id of source statement</li>
          <li>
            "source_component", must be one of{" "}
            {SourceComponentSchema.options.map((o) => `"${o}"`).join(", ")}
          </li>
          <li>"target_statement", id of target statement</li>
          <li>
            "target_component", must be one of{" "}
            {TargetComponentSchema.options.map((o) => `"${o}"`).join(", ")}
          </li>
          <li>
            "driven_by", must be one of{" "}
            {drivenbySchema.options.map((o) => `"${o}"`).join(", ")}
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

      <h3 className="py-4 text-xl">Component level network page</h3>
      <p>
        The{" "}
        <Link className="underline" to="/network/comp">
          component network page
        </Link>{" "}
        visualizes the statements, their inner components and their connections
        as a graph network.
      </p>
      <ul className="list-inside list-disc">
        <li>
          <strong>Dragging:</strong> You can move things around by dragging.
          Press left mouse key and start dragging the statement or a component
          of a statement or the background.
        </li>
        <li>
          <strong>Zoom:</strong> Use zoom buttons in bottom left to zoom in or
          out. Or use the mouse wheel to zoom in or out.
        </li>
        <li>
          <strong>Draw connection between statements:</strong>
          <ol className="ml-6 list-inside list-decimal">
            <li>Find a component you want to start from.</li>
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
          <strong>Search:</strong> Click the <SearchIcon className="inline" />{" "}
          search button and write text in text box. Click on a hit to center on
          that component.
        </li>
        <li>
          <strong>Legend:</strong> Click the{" "}
          <AlignVerticalDistributeCenterIcon className="inline" /> Legend button
          to see a legend of the network. The type components of a statement are
          shown as a sub-graph. The colors of the statements and connections are
          explained.
        </li>
        <li>
          <strong>
            <MenuIcon className="inline" /> Menu:
          </strong>
          : The menu in the top right holds less used actions.
          <ul className="ml-6 list-inside list-disc">
            <li>
              <strong>
                <LayoutTemplateIcon className="inline" />
                Layout:
              </strong>{" "}
              To layout the graph using a layout algorithm use the layout button at
              the top right side.
            </li>
            <li>
              <strong>
                <CameraIcon className="inline" /> Screenshot:
              </strong>{" "}
              Download your network as you see it at the moment as PNG image.
            </li>
            <li>
              <strong>
                <DownloadIcon className="inline" /> Export as graphml:
              </strong>{" "}
              Download the network as a{" "}
              <a className="underline" href="http://graphml.graphdrawing.org/">
                graphml
              </a>{" "}
              formatted file. The file can be imported in generic graph tools
              like{" "}
              <a
                target="_blank"
                className="underline"
                href="https://cytoscape.org"
              >
                Cytoscape
              </a>
              .
            </li>
            <li>
              <strong>
                <DownloadIcon className="inline" /> Export as gexf:
              </strong>{" "}
              Download the network as a{" "}
              <a className="underline" href="https://gexf.net/">
                GEXF
              </a>{" "}
              formatted file. The file can be imported in generic graph tools
              like{" "}
              <a
                target="_blank"
                className="underline"
                href="https://gephi.org/"
              >
                Gephi
              </a>
              .
            </li>
          </ul>
        </li>

        <li>
          <strong>Resize statement:</strong> The bottom right corner has a{" "}
          <Maximize2Icon className="inline" /> which can be dragged to resize
          the statement box.
        </li>

        <li>
          <strong>Minimap:</strong>
          The minimap in the lower right corner gives you an overview of the
          network. You can drag the rectangle to navigate the network. You can
          click to center the network there.
        </li>
      </ul>

      <h3 className="py-4 text-xl">Statement level network page</h3>
      <p>
        The{" "}
        <Link className="underline" to="/network/comp">
          component network page
        </Link>{" "}
        visualizes the statements and their connections as a graph network. The
        components of a statement are not shown, so the network more compact.
      </p>
      <ul className="list-inside list-disc">
        <li>
          <strong>Dragging:</strong> You can move things around by dragging.
          Press left mouse key and start dragging the statement or the
          background.
        </li>
        <li>
          <strong>Zoom:</strong> Use zoom buttons in bottom left to zoom in or
          out. Or use the mouse wheel to zoom in or out.
        </li>
        <li>
          <strong>Draw connection between statements:</strong>
          <ol className="ml-6 list-inside list-decimal">
            <li>Find a statement you want to start from.</li>
            <li>
              Press left mouse button on colored circle to start making a
              connection. Each color determines what the connections is driven
              by.
            </li>
            <li>
              Drag the mouse to same colored circle and release mouse key. If a
              connection can be made it will snap in place.
            </li>
          </ol>
        </li>
        <li>
          <strong>Search:</strong> Click the <SearchIcon className="inline" />{" "}
          search button and write text in text box. Click on a hit to center on
          that statement.
        </li>
        <li>
          <strong>Legend:</strong> Click the{" "}
          <AlignVerticalDistributeCenterIcon className="inline" /> Legend button
          to see a legend of the network. The colors of the statements and
          connections are explained.
        </li>
        <li>
          <strong>
            <MenuIcon className="inline" /> Menu:
          </strong>
          : The menu in the top right holds less used actions.
          <ul className="ml-6 list-inside list-disc">
            <li>
              <strong>
                <LayoutTemplateIcon className="inline" /> Layout:
              </strong>{" "}
              To layout the graph using a layout algorithm use the layout button at
              the top right side.
            </li>
            <li>
              <strong>
                <CameraIcon className="inline" /> Take screenshot:
              </strong>{" "}
              Download your network as PNG image.
            </li>
            <li>
              <strong>
                <DownloadIcon className="inline" /> Export as graphml:
              </strong>{" "}
              Download the network as a{" "}
              <a className="underline" href="http://graphml.graphdrawing.org/">
                graphml
              </a>{" "}
              formatted file. The file can be imported in generic graph tools
              like{" "}
              <a
                target="_blank"
                className="underline"
                href="https://gephi.org/"
              >
                Gephi
              </a>{" "}
              or{" "}
              <a
                target="_blank"
                className="underline"
                href="https://cytoscape.org"
              >
                Cytoscape
              </a>
              .
            </li>
          </ul>
        </li>
        <li>
          <strong>Resize statement:</strong> The bottom right corner has a{" "}
          <Maximize2Icon className="inline" /> which can be dragged to resize
          the statement box.
        </li>

        <li>
          <strong>Minimap: </strong> The minimap in the lower right corner gives
          you an overview of the network. You can drag the rectangle to navigate
          the network. You can click to center the network there.
        </li>
        <li>
          <strong>Selecting: </strong> To see details of a statement, click on
          the statement. The details will be shown in a panel on the right side
          on the node. To see details of multiple statements, hold down the ctrl
          key and click on multiple nodes or hold shift key and drag a rectangle
          around nodes.
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
            can select the driven by, source and target statements. Press the{" "}
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
