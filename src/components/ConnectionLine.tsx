import { ConnectionLineComponentProps, useConnection } from "@xyflow/react";
import { useMemo } from "react";
import { strokeColor } from "./drivenColors";

export function ConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
}: ConnectionLineComponentProps) {
  const { fromHandle, toHandle } = useConnection();
  const stroke = useMemo(() => {
    const color = fromHandle?.id || toHandle?.id;
    const stroke = color
      ? strokeColor[color as keyof typeof strokeColor]
      : "stroke-foreground";
    return stroke;
  }, [fromHandle?.id, toHandle?.id]);

  return (
    <g>
      <path
        fill="none"
        className={"animated stroke-2 " + stroke}
        d={`M${fromX},${fromY} C ${fromX} ${toY} ${fromX} ${toY} ${toX},${toY}`}
      />
      <circle
        cx={toX}
        cy={toY}
        fill="#fff"
        r={3}
        className={stroke}
        strokeWidth={1.5}
      />
    </g>
  );
}
