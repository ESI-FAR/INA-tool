import { useReactFlow, XYPosition, MiniMap } from "@xyflow/react";
import { useCallback, type MouseEvent } from "react";
import { minimapNodeClassName } from "./nodes";

export function MyMiniMap() {
  const { setCenter } = useReactFlow();
  const onClick = useCallback(
    (_: MouseEvent, position: XYPosition) => {
      setCenter(position.x, position.y, { duration: 500 });
    },
    [setCenter],
  );
  return (
    <MiniMap
      pannable={true}
      nodeClassName={minimapNodeClassName}
      onClick={onClick}
    />
  );
}
