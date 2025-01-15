import { ScopesPlugin, Presets as ScopesPresets } from "rete-scopes-plugin";
import {
  AutoArrangePlugin,
  Presets as ArrangePresets,
} from "rete-auto-arrange-plugin";
import { createRoot } from "react-dom/client";
import { NodeEditor, GetSchemes, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import { ReactPlugin, Presets, ReactArea2D } from "rete-react-plugin";
import { Statement } from "./schema";
import {
  GreenConnectionComponent,
  GreenSocketComponent,
  PurpleConnectionComponent,
  PurpleSocketComponent,
  RedConnectionComponent,
  RedSocketComponent,
  StatementNodeComp,
} from "@/components/Nodes";

const socket = new ClassicPreset.Socket("socket");

class GreenSocket extends ClassicPreset.Socket {
  constructor() {
    super("Green");
  }

  isCompatibleWith(socket: ClassicPreset.Socket) {
    return socket instanceof GreenSocket;
  }
}

class PurpleSocket extends ClassicPreset.Socket {
  constructor() {
    super("Purple");
  }

  isCompatibleWith(socket: ClassicPreset.Socket) {
    return socket instanceof PurpleSocket;
  }
}

class RedSocket extends ClassicPreset.Socket {
  constructor() {
    super("Red");
  }

  isCompatibleWith(socket: ClassicPreset.Socket) {
    return socket instanceof RedSocket;
  }
}

class Node extends ClassicPreset.Node {
  width = 180;
  height = 220;
  parent?: string;

  constructor(name: string) {
    super(name);

    this.addInput("port", new ClassicPreset.Input(socket));
    this.addOutput("port", new ClassicPreset.Output(socket));

    // TODO render input and output sockets next to each other
    // Now output sockets are listed up right and input sockets are below them on left.

    this.addInput("green", new ClassicPreset.Input(new GreenSocket()));
    this.addOutput("green", new ClassicPreset.Output(new GreenSocket()));

    this.addInput("purple", new ClassicPreset.Input(new PurpleSocket()));
    this.addOutput("purple", new ClassicPreset.Output(new PurpleSocket()));

    this.addInput("red", new ClassicPreset.Input(new RedSocket()));
    this.addOutput("red", new ClassicPreset.Output(new RedSocket()));
  }
}

class Connection<N extends Node> extends ClassicPreset.Connection<N, N> {}

type Schemes = GetSchemes<Node, Connection<Node>>;

type AreaExtra = ReactArea2D<Schemes>;

export async function createEditor(container: HTMLElement) {
  const socket = new ClassicPreset.Socket("socket");

  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });
  const scopes = new ScopesPlugin<Schemes>();

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  render.addPreset(
    Presets.classic.setup({
      customize: {
        node(context) {
          if (!context.payload.parent) {
            return StatementNodeComp;
          }
          return Presets.classic.Node;
        },
        socket(data) {
          if (data.payload instanceof GreenSocket) {
            return GreenSocketComponent;
          }
          if (data.payload instanceof PurpleSocket) {
            return PurpleSocketComponent;
          }
          if (data.payload instanceof RedSocket) {
            return RedSocketComponent;
          }
          return Presets.classic.Socket;
        },
        connection(data) {
          const source = editor.getNode(data.payload.source);
          const target = editor.getNode(data.payload.target);
          if (source instanceof GreenSocket && target instanceof GreenSocket) {
            return GreenConnectionComponent;
          }
          if (
            source instanceof PurpleSocket &&
            target instanceof PurpleSocket
          ) {
            return PurpleConnectionComponent;
          }
          if (source instanceof RedSocket && target instanceof RedSocket) {
            return RedConnectionComponent;
          }
          return Presets.classic.Connection;
        },
      },
    }),
  );

  connection.addPreset(ConnectionPresets.classic.setup());

  scopes.addPreset(ScopesPresets.classic.setup());

  editor.use(area);
  area.use(connection);
  area.use(scopes);
  area.use(render);

  const arrange = new AutoArrangePlugin<Schemes>();

  arrange.addPreset(ArrangePresets.classic.setup());

  area.use(arrange);

  const a = new Node("A");
  a.addControl("a", new ClassicPreset.InputControl("text", { initial: "a" }));
  a.addOutput("a", new ClassicPreset.Output(socket));
  await editor.addNode(a);

  const b = new Node("B");
  b.addControl("b", new ClassicPreset.InputControl("text", { initial: "b" }));
  b.addInput("b", new ClassicPreset.Input(socket));
  await editor.addNode(b);

  await editor.addConnection(new ClassicPreset.Connection(a, "a", b, "b"));

  await area.translate(a.id, { x: 0, y: 0 });
  await area.translate(b.id, { x: 270, y: 0 });

  setTimeout(() => {
    // wait until nodes rendered because they dont have predefined width and height
    AreaExtensions.zoomAt(area, editor.getNodes());
  }, 10);
  return {
    load: async (statements: Statement[]) => {
      await editor.clear();
      for (const statement of statements) {
        const parentNode = new Node(statement.Id ?? "unknown");
        await editor.addNode(parentNode);

        const attributeNode = new Node(statement.Attribute);

        if (statement["Activation Condition"]) {
          const activationConditionNode = new Node(
            statement["Activation Condition"],
          );
          activationConditionNode.parent = parentNode.id;
          await editor.addNode(activationConditionNode);
          await editor.addConnection(
            new ClassicPreset.Connection(
              activationConditionNode,
              "port",
              attributeNode,
              "port",
            ),
          );
        }

        const aimNode = new Node(statement.Aim);
        if (statement["Direct Object"]) {
          const directObjectNode = new Node(statement["Direct Object"]);
          directObjectNode.parent = parentNode.id;
          await editor.addNode(directObjectNode);
          await editor.addConnection(
            new ClassicPreset.Connection(
              aimNode,
              "port",
              directObjectNode,
              "port",
            ),
          );

          if (statement["Indirect Object"]) {
            const indirectObjectNode = new Node(statement["Indirect Object"]);
            indirectObjectNode.parent = parentNode.id;
            await editor.addNode(indirectObjectNode);
            await editor.addConnection(
              new ClassicPreset.Connection(
                directObjectNode,
                "port",
                indirectObjectNode,
                "port",
              ),
            );
          }
        }

        attributeNode.parent = parentNode.id;
        aimNode.parent = parentNode.id;

        await editor.addNode(attributeNode);
        await editor.addNode(aimNode);

        await editor.addConnection(
          new ClassicPreset.Connection(attributeNode, "port", aimNode, "port"),
        );
        // TODO for deontic unable ta add label to connection, that feature costs money

        if (statement["Execution Constraint"]) {
          const executionConstraintNode = new Node(
            statement["Execution Constraint"],
          );
          executionConstraintNode.parent = parentNode.id;
          await editor.addNode(executionConstraintNode);
          await editor.addConnection(
            new ClassicPreset.Connection(
              aimNode,
              "port",
              executionConstraintNode,
              "port",
            ),
          );
        }

        // TODO add padding between scopes aka parent nodes

        // TODO render colored connections
        await arrange.layout();
      }
    },
    layout: async () => {
      await arrange.layout();
      AreaExtensions.zoomAt(area, editor.getNodes());
    },
    resetZoom: () => AreaExtensions.zoomAt(area, editor.getNodes()),
    destroy: () => area.destroy(),
  };
}
