import { readFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";

test.describe("Shuffle statements", () => {
  test("Newly added statements are rendered in the canvas in the 'nth' position, meaning that if I first delete statement F3 and then add a new one, it's rendered on top of F6.", async ({
    page,
  }) => {
    await page.goto("/");
    // Clear
    page.on("dialog", (dialog) => dialog.accept());
    await page.getByRole("link", { name: "Statements table" }).click();

    await page.getByRole("button", { name: "Clear" }).click();

    await page.getByRole("button", { name: "Load Example" }).click();

    /// Delete statement 3
    await page.getByRole("row", { name: "3" }).getByLabel("Select").click();
    await page.getByRole("button", { name: "Delete selected" }).click();

    // Add statement
    await page.getByRole("button", { name: "Add statement" }).click();
    await page.locator('input[name="Attribute"]').fill("dum");
    await page.locator('input[name="Aim"]').fill("my");
    await page.getByRole("button", { name: "Save" }).click();

    // uncomment for debugging
    //   await page.getByRole("link", { name: "Component network" }).click();
    //   await page.screenshot({ path: "component-network.png" });
    //   await page.getByRole("link", { name: "Statement network" }).click();
    //   await page.screenshot({ path: "statement-network.png" });

    // Verify location of statement in networks
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download project" }).click();
    const download = await downloadPromise;
    const path = await download.path();
    const project = JSON.parse(await readFile(path, "utf8"));
    // uncomment for debugging
    //   download.saveAs("/tmp/test-project.json");

    // Sanity checks
    expect({
      statements: project.statements.length,
      connections: project.connections.length,
      conflicts: project.conflicts.length,
      componentNodes: project.graph.component.nodes.length,
      componentEdges: project.graph.component.edges.length,
      statementNodes: project.graph.statement.nodes.length,
      statementEdges: project.graph.statement.edges.length,
    }).toEqual({
      statements: 6,
      connections: 1,
      conflicts: 0,
      componentNodes: 29,
      componentEdges: 18,
      statementNodes: 6,
      statementEdges: 1,
    });

    // Check that y positions are unique for statement network
    // jq .graph.statement.nodes[].position.y < /tmp/test-project.json
    const statementYs = new Set();
    for (const node of project.graph.statement.nodes) {
      const y = node.position.y;
      if (statementYs.has(y)) {
        throw new Error("Two statements have the same y position", node);
      }
      statementYs.add(y);
    }

    // Check that y positions are unique for component network
    // jq '.graph.component.nodes[] | select(.type == "statement").position.y' < /tmp/test-project.json
    const componentYs = new Set();
    for (const node of project.graph.component.nodes.filter(
      (node) => node.type === "statement",
    )) {
      const y = node.position.y;
      if (componentYs.has(y)) {
        throw new Error("Two components have the same y position", node);
      }
      componentYs.add(y);
    }
  });
});
