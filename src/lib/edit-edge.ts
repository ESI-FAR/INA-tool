import { EndPoints } from "@/hooks/use-path";
import { Bends } from "./edge";

export function keyboardEventOnHandle(
  key: string,
  index: number,
  bends: Bends,
  _endpoints: EndPoints,
  updateBends: (bends: Bends) => void,
  useBigStep: boolean,
  isUnlinked: boolean,
) {
  const stepSize = useBigStep ? 10 : 1;

  if (key === "Delete" || key === "Backspace") {
    const newBends = bends.filter((_, i) => i !== index);
    updateBends(newBends);
  }
  if (key === "p") {
    const newBends = bends.map((b) => [...b] as [number, number]); // Create a deep copy
    let nextBend = bends[index + 1];
    if (!nextBend) {
      nextBend = [_endpoints.targetX, _endpoints.targetY];
    }
    const newX = (bends[index][0] + nextBend[0]) / 2;
    const newY = (bends[index][1] + nextBend[1]) / 2;
    newBends.splice(index + 1, 0, [newX, newY]);
    console.log({
      bends,
      newBends,
    });
    updateBends(newBends);
  }

  if (key === "ArrowUp") {
    const newBends = bends.map((b) => [...b] as [number, number]); // Create a deep copy
    const originalY = bends[index][1];
    newBends[index][1] -= stepSize;
    // Check previous bend
    if (!isUnlinked && index > 0 && bends[index - 1][1] === originalY) {
      newBends[index - 1][1] = newBends[index][1];
    }
    // Check next bend
    if (
      !isUnlinked &&
      index < bends.length - 1 &&
      bends[index + 1][1] === originalY
    ) {
      newBends[index + 1][1] = newBends[index][1];
    }
    updateBends(newBends);
  }
  if (key === "ArrowDown") {
    const newBends = bends.map((b) => [...b] as [number, number]); // Create a deep copy
    const originalY = bends[index][1];
    newBends[index][1] += stepSize;
    // Check previous bend
    if (!isUnlinked && index > 0 && bends[index - 1][1] === originalY) {
      newBends[index - 1][1] = newBends[index][1];
    }
    // Check next bend
    if (
      !isUnlinked &&
      index < bends.length - 1 &&
      bends[index + 1][1] === originalY
    ) {
      newBends[index + 1][1] = newBends[index][1];
    }
    updateBends(newBends);
  }
  if (key === "ArrowLeft") {
    const newBends = bends.map((b) => [...b] as [number, number]); // Create a deep copy
    const originalX = bends[index][0];
    newBends[index][0] -= stepSize;
    // Check previous bend
    if (!isUnlinked && index > 0 && bends[index - 1][0] === originalX) {
      newBends[index - 1][0] = newBends[index][0];
    }
    // Check next bend
    if (
      !isUnlinked &&
      index < bends.length - 1 &&
      bends[index + 1][0] === originalX
    ) {
      newBends[index + 1][0] = newBends[index][0];
    }
    updateBends(newBends);
  }
  if (key === "ArrowRight") {
    const newBends = bends.map((b) => [...b] as [number, number]); // Create a deep copy
    const originalX = bends[index][0];
    newBends[index][0] += stepSize;
    // Check previous bend
    if (!isUnlinked && index > 0 && bends[index - 1][0] === originalX) {
      newBends[index - 1][0] = newBends[index][0];
    }
    // Check next bend
    if (
      !isUnlinked &&
      index < bends.length - 1 &&
      bends[index + 1][0] === originalX
    ) {
      newBends[index + 1][0] = newBends[index][0];
    }
    updateBends(newBends);
  }
  if (key === "s") {
    const newBends = bends.map((b) => [...b] as [number, number]); // Create a deep copy
    const currentBend = bends[index];
    const currentX = currentBend[0];
    const currentY = currentBend[1];

    let prevX: number, prevY: number;
    if (index === 0) {
      prevX = _endpoints.sourceX;
      prevY = _endpoints.sourceY;
    } else {
      [prevX, prevY] = bends[index - 1];
    }

    let nextX: number, nextY: number;
    if (index === bends.length - 1) {
      nextX = _endpoints.targetX;
      nextY = _endpoints.targetY;
    } else {
      [nextX, nextY] = bends[index + 1];
    }

    // Option 1: Snap to (prevX, nextY)
    // Segment from prevPoint to currentBend becomes vertical
    // Segment from currentBend to nextPoint becomes horizontal
    const snapPos1: [number, number] = [prevX, nextY];
    const distSq1 =
      (currentX - snapPos1[0]) ** 2 + (currentY - snapPos1[1]) ** 2;

    // Option 2: Snap to (nextX, prevY)
    // Segment from prevPoint to currentBend becomes horizontal
    // Segment from currentBend to nextPoint becomes vertical
    const snapPos2: [number, number] = [nextX, prevY];
    const distSq2 =
      (currentX - snapPos2[0]) ** 2 + (currentY - snapPos2[1]) ** 2;

    if (distSq1 <= distSq2) {
      newBends[index][0] = snapPos1[0];
      newBends[index][1] = snapPos1[1];
    } else {
      newBends[index][0] = snapPos2[0];
      newBends[index][1] = snapPos2[1];
    }
    updateBends(newBends);
  }
}
