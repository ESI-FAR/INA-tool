/**
 * Generate a points of a SVG polygon for rendering a hexagon.
 * Hexagon has flat top and bottom and triangular sides.
 *
 * @param height
 * @param textboxWidth
 * @param sideWidth
 */
export function hexagonPolygonPoints(
  height: number,
  textboxWidth: number,
  sideWidth = 20,
) {
  const points = [
    `${sideWidth},0`,
    `${textboxWidth + sideWidth},0`,
    `${textboxWidth + sideWidth + sideWidth},${height / 2}`,
    `${textboxWidth + sideWidth},${height}`,
    `${sideWidth},${height}`,
    `0,${height / 2}`,
  ];
  return points.join(" ");
}
