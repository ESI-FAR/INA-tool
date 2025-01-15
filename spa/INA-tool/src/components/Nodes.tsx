import { ClassicPreset } from "rete";
import { ClassicScheme, RenderEmit, Presets } from "rete-react-plugin";
import { css } from "styled-components";

type NodeExtraData = { width?: number; height?: number };

type Props<S extends ClassicScheme> = {
  data: S["Node"] & NodeExtraData;
  styles?: () => any;
  emit: RenderEmit<S>;
};

export function StatementNodeComp<Scheme extends ClassicScheme>(
  props: Props<Scheme>,
) {
  return (
    <fieldset className="rounded-md border border-gray-300 bg-transparent p-4 shadow-md">
      <legend>{props.data.label}</legend>
    </fieldset>
  );
}

export function GreenSocketComponent<T extends ClassicPreset.Socket>(props: {
  data: T;
}) {
  return (
    <div
      title={props.data.name}
      className="border-3 z-2 multiple:border-yellow-500 m-1 box-border inline-block h-5 w-5 cursor-pointer rounded-full border-green-300 bg-green-300/40 align-middle hover:border-4"
    />
  );
}

export function PurpleSocketComponent<T extends ClassicPreset.Socket>(props: {
  data: T;
}) {
  return (
    <div
      title={props.data.name}
      className="border-3 border-purple-300-300 z-2 multiple:border-yellow-500 m-1 box-border inline-block h-5 w-5 cursor-pointer rounded-full bg-purple-300/40 align-middle hover:border-4"
    />
  );
}

export function RedSocketComponent<T extends ClassicPreset.Socket>(props: {
  data: T;
}) {
  return (
    <div
      title={props.data.name}
      className="border-3 z-2 multiple:border-yellow-500 m-1 box-border inline-block h-5 w-5 cursor-pointer rounded-full border-red-300 bg-red-300/40 align-middle hover:border-4"
    />
  );
}

const { Connection } = Presets.classic;

const greenConnectionStyles = css`
  stroke: #green;
`;

export function GreenConnectionComponent(props: {
  data: ClassicScheme["Connection"] & { isLoop?: boolean };
}) {
  return <Connection {...props} styles={() => greenConnectionStyles} />;
}

const redConnectionStyles = css`
  stroke: #ff0000;
`;

export function RedConnectionComponent(props: {
  data: ClassicScheme["Connection"] & { isLoop?: boolean };
}) {
  return <Connection {...props} styles={() => redConnectionStyles} />;
}

const purpleConnectionStyles = css`
  stroke: #800080;
`;

export function PurpleConnectionComponent(props: {
  data: ClassicScheme["Connection"] & { isLoop?: boolean };
}) {
  return <Connection {...props} styles={() => purpleConnectionStyles} />;
}
