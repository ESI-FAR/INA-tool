import { Statement } from "./schema";

export function wrapText(
  text: string,
  maxCharsPerLine = 20,
  minCharsPerLine = 8,
): {
  lines: string[];
  widthInChars: number;
} {
  const tokens = text.split(" ");
  const lines = [];
  let currentLine = "";
  for (const token of tokens) {
    if (currentLine.length + token.length <= maxCharsPerLine) {
      currentLine += token + " ";
    } else {
      lines.push(currentLine.trim());
      currentLine = token + " ";
    }
  }
  if (currentLine) {
    lines.push(currentLine.trim());
  }
  const widthInChars = Math.max(...lines.map((l) => l.length), minCharsPerLine);
  return {
    widthInChars,
    lines,
  };
}

export interface TextBoxOptions {
  fontWidth: number;
  fontHeight: number;
  linePadding: number;
  xPad: number;
  yPad: number;
  widthInChars: number;
}

/**
 * Calculate how much room the text lines will take up in pixels.
 *
 * Returns the width and height of the text box
 * and the position of each line in the box.
 *
 */
export function lines2Box(
  lines: string[],
  options: Partial<TextBoxOptions> = {},
): {
  width: number;
  height: number;
  positions: { x: number; y: number }[];
} {
  const defaults: TextBoxOptions = {
    widthInChars: 20,
    fontWidth: 8,
    fontHeight: 16,
    linePadding: 4,
    xPad: 2,
    yPad: 2,
  };

  const opts = { ...defaults, ...options };

  const width = opts.widthInChars * opts.fontWidth + opts.xPad * 2;
  const height =
    lines.length * (opts.fontHeight + opts.linePadding) + opts.yPad * 2;
  const positions = lines.map((_line, i) => ({
    x: opts.xPad,
    y: opts.yPad + opts.fontHeight + i * (opts.fontHeight + opts.linePadding),
  }));

  return {
    width,
    height,
    positions,
  };
}

function heightOfTextBox(text: string) {
  return lines2Box(wrapText(text).lines).height;
}

export function calcMaxComponentHeight(statement: Statement): number {
  const padding = 40;
  return (
    Math.max(
      heightOfTextBox(statement["Attribute"] ?? ""),
      heightOfTextBox(statement["Aim"] ?? "") +
        padding +
        heightOfTextBox(statement["Execution Constraint"] ?? ""),
      heightOfTextBox(statement["Direct Object"] ?? "") +
        padding +
        heightOfTextBox(statement["Indirect Object"] ?? ""),
      heightOfTextBox(statement["Activation Condition"] ?? ""),
      heightOfTextBox(statement["Or Else"] ?? ""),
    ) + padding
  );
}
