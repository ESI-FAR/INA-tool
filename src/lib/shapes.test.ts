import { describe, expect, test } from "vitest";
import {
  hexagonPath,
  hexagonPolygonPoints,
  lines2Box,
  wrapText,
} from "./shapes";

describe("wrapText()", () => {
  test("single word", () => {
    const result = wrapText("hello");
    expect(result.lines).toEqual(["hello"]);
    expect(result.widthInChars).toEqual(8);
  });

  test("multiple words", () => {
    const result = wrapText("hello world this is a test");
    expect(result.lines).toEqual(["hello world this is", "a test"]);
    expect(result.widthInChars).toEqual(19);
  });
});

describe("lines2box()", () => {
  test("single line with default options", () => {
    const result = lines2Box(["hello"]);
    const expected = { width: 164, height: 24, positions: [{ x: 2, y: 18 }] };
    expect(result).toEqual(expected);
  });

  test("multiple lines with default options", () => {
    const result = lines2Box(["hello", "world"]);
    const expected = {
      width: 164,
      height: 44,
      positions: [
        { x: 2, y: 18 },
        { x: 2, y: 38 },
      ],
    };
    expect(result).toEqual(expected);
  });
});

describe("hexagonPolygonPoints()", () => {
  test("default side width", () => {
    const result = hexagonPolygonPoints(60, 200, 20);
    expect(result).toEqual("20,0 220,0 240,30 220,60 20,60 0,30");
  });
});
