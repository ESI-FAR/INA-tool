import { INACEdge, INASEdge } from "./edge";
import { INANode, StatementNode } from "./node";

export function exportStatementNetworkToGraphml(
  projectName: string,
  nodes: StatementNode[],
  edges: INASEdge[],
) {
  const xmlParts: string[] = generateGraphMLHeader();
  // White space not allowed in name and id attributes, so replace ' ' with '_'
  xmlParts.push(
    '<key attr.name="Statement_Type" attr.type="string" for="node" id="Statement_Type" />',
  );
  xmlParts.push(
    '<key attr.name="Aim" attr.type="string" for="node" id="Aim" />',
  );
  xmlParts.push(
    '<key attr.name="Attribute" attr.type="string" for="node" id="Attribute" />',
  );
  xmlParts.push(
    '<key attr.name="Deontic" attr.type="string" for="node" id="Deontic" />',
  );
  xmlParts.push(
    '<key attr.name="Direct_Object" attr.type="string" for="node" id="Direct_Object" />',
  );
  xmlParts.push(
    '<key attr.name="Type_of_Direct_Object" attr.type="string" for="node" id="Type_of_Direct_Object" />',
  );
  xmlParts.push(
    '<key attr.name="Indirect_Object" attr.type="string" for="node" id="Indirect_Object" />',
  );
  xmlParts.push(
    '<key attr.name="Type_of_Indirect_Object" attr.type="string" for="node" id="Type_of_Indirect_Object" />',
  );
  xmlParts.push(
    '<key attr.name="Activation_Condition" attr.type="string" for="node" id="Activation_Condition" />',
  );
  xmlParts.push(
    '<key attr.name="Execution_Constraint" attr.type="string" for="node" id="Execution_Constraint" />',
  );
  xmlParts.push(
    '<key attr.name="Or_Else" attr.type="string" for="node" id="Or_Else" />',
  );

  // Edge keys
  xmlParts.push(
    '<key attr.name="driven_by" attr.type="string" id="driven_by" for="edge"/>',
  );

  xmlParts.push(`<graph id="${projectName}" edgedefault="directed">`);

  // Add nodes to the graph
  for (const node of nodes) {
    xmlParts.push(`<node id="${node.id}">`);
    xmlParts.push(`<data key="label">${node.data.label}</data>`);
    xmlParts.push(`<data key="x">${node.position.x}</data>`);
    xmlParts.push(`<data key="y">${node.position.y}</data>`);
    xmlParts.push(
      `<data key="Statement_Type">${node.data.raw["Statement Type"]}</data>`,
    );
    xmlParts.push(`<data key="Aim">${node.data.raw["Aim"]}</data>`);
    xmlParts.push(`<data key="Attribute">${node.data.raw["Attribute"]}</data>`);
    xmlParts.push(`<data key="Deontic">${node.data.raw["Deontic"]}</data>`);
    if (node.data.raw["Direct Object"]) {
      xmlParts.push(
        `<data key="Direct_Object">${node.data.raw["Direct Object"]}</data>`,
      );
    }
    if (node.data.raw["Type of Direct Object"]) {
      xmlParts.push(
        `<data key="Type_of_Direct_Object">${node.data.raw["Type of Direct Object"]}</data>`,
      );
    }
    if (node.data.raw["Indirect Object"]) {
      xmlParts.push(
        `<data key="Indirect_Object">${node.data.raw["Indirect Object"]}</data>`,
      );
    }
    if (node.data.raw["Type of Indirect Object"]) {
      xmlParts.push(
        `<data key="Type_of_Indirect_Object">${node.data.raw["Type of Indirect Object"]}</data>`,
      );
    }
    if (node.data.raw["Activation Condition"]) {
      xmlParts.push(
        `<data key="Activation_Condition">${node.data.raw["Activation Condition"]}</data>`,
      );
    }
    if (node.data.raw["Execution Constraint"]) {
      xmlParts.push(
        `<data key="Execution_Constraint">${node.data.raw["Execution Constraint"]}</data>`,
      );
    }
    if (node.data.raw["Or Else"]) {
      xmlParts.push(`<data key="Or_Else">${node.data.raw["Or Else"]}</data>`);
    }

    // TODO add node color: formal=sky, informal=yellow
    xmlParts.push(`</node>`);
  }

  // Add edges to the graph
  for (const edge of edges) {
    xmlParts.push(
      `<edge id="${edge.id}" source="${edge.source}" target="${edge.target}">`,
    );
    xmlParts.push(`<data key="driven_by">${edge.type}</data>`);
    // TODO add edge color: actor=purple, outcome=green, sanction=red, conflict=red

    xmlParts.push(`</edge>`);
  }

  return generateGraphMLFile(xmlParts, projectName);
}

function generateGraphMLFile(xmlParts: string[], projectName: string) {
  xmlParts.push("</graph>");
  xmlParts.push("</graphml>");

  const xmlString = xmlParts.join("");
  const file = new File([xmlString], `${projectName}.graphml`, {
    type: "application/xml",
  });
  return file;
}

function generateGraphMLHeader() {
  const xmlParts: string[] = [];
  xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>');
  xmlParts.push(
    '<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">',
  );
  // Node keys
  xmlParts.push(
    '<key attr.name="label" attr.type="string" id="label" for="node"/>',
  );
  xmlParts.push('<key attr.name="x" attr.type="float" for="node" id="x" />');
  xmlParts.push('<key attr.name="y" attr.type="float" for="node" id="y" />');
  return xmlParts;
}

export function exportComponentNetworkToGraphml(
  projectName: string,
  nodes: INANode[],
  edges: INACEdge[],
) {
  const xmlParts: string[] = generateGraphMLHeader();
  xmlParts.push(
    '<key attr.name="type" attr.type="string" for="node" id="ntype" />',
  );
  // Edge keys
  xmlParts.push(
    '<key attr.name="type" attr.type="string" for="edge" id="etype" />',
  );

  xmlParts.push(`<graph id="${projectName}" edgedefault="directed">`);

  for (const node of nodes) {
    if (node.parentId) {
      // Skip component nodes, they are added as part of their parent node
      continue;
    }
    xmlParts.push(`<node id="${node.id}">`);
    xmlParts.push(`<data key="label">${node.data.label}</data>`);
    xmlParts.push(`<data key="x">${node.position.x}</data>`);
    xmlParts.push(`<data key="y">${node.position.y}</data>`);
    xmlParts.push(`<data key="ntype">${node.type}</data>`);
    xmlParts.push(`<graph id="${node.id}:" edgedefault="undirected">`);
    for (const component of nodes.filter((n) => n.parentId === node.id)) {
      xmlParts.push(`<node id="${component.id}">`);
      xmlParts.push(`<data key="label">${component.data.label}</data>`);
      xmlParts.push(
        `<data key="x">${node.position.x + component.position.x}</data>`,
      );
      xmlParts.push(
        `<data key="y">${node.position.y + component.position.y}</data>`,
      );
      xmlParts.push(`<data key="ntype">${component.type}</data>`);
      xmlParts.push(`</node>`);
    }
    for (const edge of edges.filter((e) => e.data?.statementId === node.id)) {
      xmlParts.push(
        `<edge id="${edge.id}" source="${edge.source}" target="${edge.target}">`,
      );
      if (edge.label) {
        xmlParts.push(`<data key="label">${edge.label}</data>`);
      }
      xmlParts.push(`<data key="etype">component</data>`);
      xmlParts.push(`</edge>`);
    }
    xmlParts.push(`</graph>`);
    xmlParts.push(`</node>`);
  }
  for (const edge of edges.filter((e) => !e.data?.statementId)) {
    xmlParts.push(
      `<edge id="${edge.id}" source="${edge.source}" target="${edge.target}">`,
    );
    xmlParts.push(`<data key="etype">${edge.type}</data>`);
    xmlParts.push(`</edge
    >`);
  }

  return generateGraphMLFile(xmlParts, projectName);
}

// TODO add GEXF export format as Gephi does not understand hierarchical graphs in GraphML
