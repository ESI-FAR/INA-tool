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
  EyeOff,
  FilterXIcon,
  FlaskConicalIcon,
  LayoutTemplateIcon,
  LinkIcon,
  Maximize2Icon,
  MenuIcon,
  PanelLeft,
  PencilIcon,
  PlusIcon,
  RouteIcon,
  RouteOffIcon,
  SaveIcon,
  ScalingIcon,
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
      <ul className="list-outside list-disc pl-4">
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
      <p>
        If the "Or Else" column is filled then a sanction driven connection will
        be made from that rows "Aim" to the "Activation Condition" of the
        statement with the id in the "Or Else" column.
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
      <ul className="list-outside list-disc pl-4">
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
          of web application with example loaded. Keyboard shortcut is
          CTRL+SHIFT+e.
        </li>
        <li>
          <strong>Clear:</strong>To delete all statements and connections after
          confirmation. Keyboard shortcut is CTRL+SHIFT+r.
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
      <ul className="list-outside list-disc pl-4">
        <li>
          <strong>Moving:</strong> You can move things around by dragging.
          <ul className="list-outside list-disc pl-4">
            <li>
              <strong>To pan whole network:</strong> You can pan by dragging on
              the background.
            </li>
            <li>
              <strong>To move single component:</strong> While hovering over a
              component press left mouse key and start dragging the component of
              a statement.
            </li>
            <li>
              <strong>To move single statement:</strong> While hovering inside
              the statement border, but not on a component, press left mouse key
              and start dragging the statement and all its components.
            </li>
            <li>
              <strong>To move multiple nodes:</strong> First select multiple
              statements or components by
              <ul className="ml-6 list-inside list-disc">
                <li>
                  holding down the CTRL/⌘ key and click on multiple nodes or
                </li>
                <li>holding SHIFT key and drag a rectangle around nodes.</li>
                <li>After selecting you can move them by dragging.</li>
                <li>Selected nodes have a slightly thicker borders.</li>
                <li>You can clear selection by clicking on the background.</li>
              </ul>
            </li>
          </ul>
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
          to see a legend of the network. The components of a statement are
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
                <CameraIcon className="inline" /> Screenshot:
              </strong>{" "}
              Download your network as you see it as a PNG image. Choose the
              size of the image in the sub menu. Large sizes can take a while to
              generate. The bottom buttons and minimap are not shown in the
              screenshot.
            </li>
            <li>
              <strong>
                <DownloadIcon className="inline" /> Export:
              </strong>{" "}
              Download the network in one of the following formats:
              <ul className="ml-6 list-inside list-disc">
                <li>
                  <strong>graphml:</strong> A{" "}
                  <a
                    className="underline"
                    href="http://graphml.graphdrawing.org/"
                  >
                    graphml
                  </a>{" "}
                  formatted file. The file can be imported in generic graph
                  tools like{" "}
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
                  <strong>gexf:</strong> A{" "}
                  <a className="underline" href="https://gexf.net/">
                    GEXF
                  </a>{" "}
                  formatted file. The file can be imported in generic graph
                  tools like{" "}
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
              <a id="experimental-component" />
              <strong>
                <FlaskConicalIcon className="inline" />
                Experimental
              </strong>{" "}
              Experimental features, they have some rough edges, but can be
              useful. Use at your own risk.
              <ul className="ml-6 list-inside list-disc">
                <li>
                  <strong>
                    <LayoutTemplateIcon className="inline" /> Auto layout:
                  </strong>{" "}
                  To layout the graph using a layout algorithm use the auto
                  layout menu item. This will move the component and statement
                  nodes around. Keyboard shortcut is CTRL+SHIFT+l.
                </li>
                <li>
                  <strong>
                    <LayoutTemplateIcon className="inline" /> Reset auto layout:
                  </strong>{" "}
                  To reset the auto layout and move all nodes back to their
                  naive positions. Any manual changes will be lost.
                </li>
                <li>
                  <strong>
                    <RouteIcon className="inline" /> Re-route connections:
                  </strong>{" "}
                  Reroutes connections to avoid overlapping nodes. After
                  re-routing, moving nodes will not update the connection route;
                  the inner bends of the connections will stay in same
                  positions, and only the endpoints will move with the connected
                  nodes. Keyboard shortcut is CTRL+SHIFT+c.
                </li>
                <li>
                  <strong>
                    <RouteOffIcon className="inline" />
                    Undo rerouted connections:
                  </strong>{" "}
                  Will make whole connection move with nodes again.
                </li>
                <li>
                  <strong>
                    <ScalingIcon className="inline" /> Reset component size:
                  </strong>{" "}
                  Resets the size of all components nodes to their default size.
                  This actions fixes it when edges between component nodes are
                  not connected.
                </li>
              </ul>
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
        <Link className="underline" to="/network/statement">
          statement network page
        </Link>{" "}
        visualizes the statements and their connections as a graph network. The
        components of a statement are not shown, so the network is more compact.
      </p>
      <ul className="list-outside list-disc pl-4">
        <li>
          <strong>Moving:</strong> You can move things around by dragging. Press
          left mouse key and start dragging the statement. You can pan by
          dragging on the background. To move multiple statements you can select
          them by holding down the ctrl key and click on multiple statements or
          hold shift key and drag a rectangle around statements. Selected
          statements have a slightly thicker borders. After selecting you can
          move them by dragging. You can clear selection by clicking on the
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
                <CameraIcon className="inline" /> Screenshot:
              </strong>{" "}
              Download your network as you see it as a PNG image. Choose the
              size of the image in the sub menu. Large sizes can take a while to
              generate. The bottom buttons and minimap are not shown in the
              screenshot.
            </li>
            <li>
              <strong>
                <DownloadIcon className="inline" /> Export:
              </strong>{" "}
              Download the network in one of the following formats:
              <ul className="ml-6 list-inside list-disc">
                <li>
                  <strong>graphml:</strong> A{" "}
                  <a
                    className="underline"
                    href="http://graphml.graphdrawing.org/"
                  >
                    graphml
                  </a>{" "}
                  formatted file. The file can be imported in generic graph
                  tools like{" "}
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
                <li>
                  <strong>gexf:</strong> A{" "}
                  <a className="underline" href="https://gexf.net/">
                    GEXF
                  </a>{" "}
                  formatted file. The file can be imported in generic graph
                  tools like{" "}
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
              <a id="experimental-statement" />
              <strong>
                <FlaskConicalIcon className="inline" />
                Experimental
              </strong>{" "}
              Experimental features, they have some rough edges, but can be
              useful. Use at your own risk.
              <ul className="ml-6 list-inside list-disc">
                <li>
                  <strong>
                    <LayoutTemplateIcon className="inline" /> Auto layout:
                  </strong>{" "}
                  To layout the graph using a layout algorithm use the auto
                  layout menu item. This will move the component and statement
                  nodes around. Keyboard shortcut is CTRL+SHIFT+l.
                </li>
                <li>
                  <strong>
                    <LayoutTemplateIcon className="inline" /> Reset auto layout:
                  </strong>{" "}
                  To reset the auto layout and move all nodes back to their
                  naive positions. Any manual changes will be lost.
                </li>
                <li>
                  <strong>
                    <RouteIcon className="inline" /> Re-route connections:
                  </strong>{" "}
                  Re-route connections so they avoid most nodes. After
                  re-routing, moving nodes will not update the connection route;
                  the inner bends of the connections will stay in same
                  positions, and only the endpoints will move with the connected
                  nodes. Keyboard shortcut is CTRL+SHIFT+c.
                </li>
                <li>
                  <strong>
                    <RouteOffIcon className="inline" />
                    Undo rerouted connections:
                  </strong>{" "}
                  Will make whole connection move with nodes again.
                </li>
              </ul>
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
          the statement.
          <ul className="ml-6 list-inside list-disc">
            <li>
              The details will be shown in a panel on the right side on the
              node.
            </li>
            <li>
              You can hover over text to see the component of the text in a
              tooltip.
            </li>
            <li>
              Incoming connections are shown as arrows infront of the component
              text. Tooltip will show from which statement/component the
              connection came from.
            </li>
            <li>
              Outgoing connections are shown as arrows behind the component
              text. Tooltip will show from which statement/component the
              connection goes to.
            </li>
            <li>
              To see details of multiple statements,
              <ul className="ml-6 list-inside list-disc">
                <li>hold down the CTRL/⌘ key and click on multiple nodes or</li>
                <li>hold SHIFT key and drag a rectangle around nodes.</li>
              </ul>
            </li>
            <li>
              To close the details click the <EyeOff className="inline" />{" "}
              button.
            </li>
            <li>
              To delete selected statement click the{" "}
              <TrashIcon className="inline" /> button. You will be asked for
              confirmation.
            </li>
            <li>To deselect all nodes click on the background.</li>
          </ul>
        </li>
      </ul>

      <h3 className="py-4 text-xl">Statements page</h3>
      <p>
        The{" "}
        <Link className="underline" to="/statements">
          statements page
        </Link>{" "}
        allows you to manage the statements. All sanction driven connections are
        shown as statement identifiers in the "Or Else" column.
      </p>
      <ul className="list-outside list-disc pl-4">
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
          <strong>Deleting:</strong> A statement can be deleted by selecting it
          and pressing the <TrashIcon className="inline" /> button. Any
          connections to or from this statement will also be deleted after
          confirmation.
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
        <li>
          <strong>Connections:</strong> To go to the connections of a statement
          click the <LinkIcon className="inline" /> button. This will open the
          connections page with the statement selected as target or source.
        </li>
      </ul>

      <h3 className="py-4 text-xl">Connections page</h3>
      <p>
        The{" "}
        <Link className="underline" to="/connections">
          connections page
        </Link>{" "}
        allows you to view and download the connections between statements.
        <ul className="list-outside list-disc pl-4">
          <li>
            <strong>Sorting:</strong> Click on the column header to sort the
            data. Initially sorted on the Id column.
          </li>
          <li>
            <strong>Paging:</strong> If not all data is displayed, use the
            paging buttons to navigate through the data.
          </li>
          <li>
            <strong>Deleting:</strong> A connection can be deleted by selecting
            it and by pressing the <TrashIcon className="inline" /> button.
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
          <li>
            <strong>Filtering:</strong>
            The table header has combo boxes and text boxes to filter the data
            in that column.
            <ul className="ml-6 list-inside list-disc">
              <li>
                If you have one or more filters applied they can be cleared by
                pressing the "<FilterXIcon className="inline" />
                Clear all filters" button.
              </li>
              <li>
                If you came from <LinkIcon className="inline" /> on the
                statements page, the source and target can be cleared by
                clicking the "All connections" button in the top left corner.
              </li>
            </ul>
          </li>
        </ul>
      </p>
      <h3 id="help-conflicts-page" className="py-4 text-xl">
        Conflicts page
      </h3>
      <p>
        The{" "}
        <Link className="underline" to="/conflicts">
          conflicts page
        </Link>{" "}
        allows you to mark a formal and an informal statement pair as
        conflicting with each other.
      </p>
      <ul className="list-inside list-disc">
        <li>
          <strong>Search:</strong> Write text in the search box to search for a
          conflict containing the query.
        </li>
        <li>
          <strong>Sorting:</strong> Click on the column header to sort the data.
        </li>
        <li>
          <strong>Paging:</strong> If not all data is displayed, use the paging
          buttons to navigate through the data.
        </li>
        <li>
          <strong>Deleting:</strong> A conflict can be deleted by selecting it
          and pressing the <TrashIcon className="inline" /> button.
        </li>
        <li>
          <strong>Adding:</strong> After pressing the{" "}
          <PlusIcon className="inline" /> button, a dialog will open where you
          can select the formal and informal statements. Press the Add button to
          save the new conflict.
        </li>
        <li>
          <strong>Editing:</strong> There is no edit functionality for
          conflicts. Delete and add a new conflict instead.
        </li>
        <li>
          <strong>Download:</strong> Click on the{" "}
          <DownloadIcon className="inline" /> download button to download the
          connections as a JSON file.
        </li>
        <li>
          <strong>Upload:</strong> Click on the{" "}
          <UploadIcon className="inline" /> upload button to upload a JSON file
          with conflicts. Existing conflicts will be deleted and replaced by the
          uploaded conflicts.
          <details className="inline-block cursor-pointer">
            <summary>Example</summary>

            <pre>
              {JSON.stringify(
                [
                  {
                    group: "Group name1",
                    statements: ["statementId1", "statementId2"],
                  },
                ],
                undefined,
                2,
              )}
            </pre>
          </details>
        </li>
      </ul>

      <h3 className="py-4 text-xl">Persistence</h3>
      <ul className="list-outside list-disc pl-4">
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

      <h3 className="py-4 text-xl">Manual edge editing</h3>
      <div>
        <p>
          If you do not like how the edges are routed you can edit edges
          manually. To edit an edge:
        </p>
        <ol className="list-inside list-decimal">
          <li>
            Press "Re-route connections" button in the experimental sub menu.
            Only edges that have been re-routed can be edited.
          </li>
          <li>
            Select driven connection or conflict edge by clicking on it. You can
            only select edges from outside a statement box. When selected the
            edge is a bit thicker.
          </li>
          <li>
            Select corner (circle icon) of an edge. By clicking on it if it is
            outside the statement box. Or by pressing "Tab" key to cycle through
            the corners of the edge.
          </li>
          <li>
            Manipulate corner with keyboard:
            <ul className="ml-6 list-outside list-disc pl-4">
              <li>
                Arrow keys: To move corner around.
                <ul className="ml-10 list-outside list-disc pl-4">
                  <li>Hold "shift" key to move with bigger steps.</li>
                  <li>Hold "ctrl" key to keep neighbouring corners pinned.</li>
                </ul>
              </li>
              <li>Delete or Backspace key: To remove corner.</li>
              <li>
                "p" key: To add an extra corner after the selected corner.
              </li>
              <li>"s" key: To snap corner to get 90&deg; corners.</li>
            </ul>
          </li>
          <li>
            Optionally goto another corner, by clicking it or pressing "Tab" or
            shift+"Tab" key to cycle through corners.
          </li>
          <li>
            To complete editing, unselect the edge by click on background or
            node or another edge.
          </li>
        </ol>
      </div>

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
