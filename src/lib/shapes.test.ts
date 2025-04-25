import { describe, expect, test } from "vitest";
import { hexagonPolygonPoints } from "./shapes";

describe("hexagonPolygonPoints()", () => {
  test("default side width", () => {
    const result = hexagonPolygonPoints(60, 200, 20);
    expect(result).toEqual("20,0 220,0 240,30 220,60 20,60 0,30");
  });
});
