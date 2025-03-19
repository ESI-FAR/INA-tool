import { INACEdge, INASEdge } from "./edge";
import { INANode, StatementNode } from "./node";
import { Statement } from "./schema";

export function exportStatementNetworkToGraphml(
  projectName: string,
  nodes: StatementNode[],
  edges: INASEdge[],
) {
  const xmlParts: string[] = generateGraphMLHeader();
  // White space not allowed in name and id attributes, so replace ' ' with '_'
  xmlParts.push(`
    <key attr.name="Statement_Type" attr.type="string" for="node" id="Statement_Type" />
    <key attr.name="sentence" attr.type="string" for="node" id="sentence" />
    <key attr.name="Aim" attr.type="string" for="node" id="Aim" />
    <key attr.name="Attribute" attr.type="string" for="node" id="Attribute" />
    <key attr.name="Deontic" attr.type="string" for="node" id="Deontic" />
    <key attr.name="Direct_Object" attr.type="string" for="node" id="Direct_Object" />
    <key attr.name="Type_of_Direct_Object" attr.type="string" for="node" id="Type_of_Direct_Object" />
    <key attr.name="Indirect_Object" attr.type="string" for="node" id="Indirect_Object" />
    <key attr.name="Type_of_Indirect_Object" attr.type="string" for="node" id="Type_of_Indirect_Object" />
    <key attr.name="Activation_Condition" attr.type="string" for="node" id="Activation_Condition" />
    <key attr.name="Execution_Constraint" attr.type="string" for="node" id="Execution_Constraint" />
    <key attr.name="Or_Else" attr.type="string" for="node" id="Or_Else" />
  `);

  // Edge keys
  xmlParts.push(
    '<key attr.name="driven_by" attr.type="string" id="driven_by" for="edge"/>',
  );

  xmlParts.push(`<graph id="${projectName}" edgedefault="directed">`);

  // Add nodes to the graph
  for (const node of nodes) {
    xmlParts.push(`
      <node id="${node.id}">
      <data key="label">${node.data.label}</data>
      <data key="x">${node.position.x}</data>
      <data key="y">${node.position.y}</data>
      <data key="sentence">${statementSentence(node.data.raw)}</data>
      <data key="Statement_Type">${node.data.raw["Statement Type"]}</data>
      <data key="Aim">${node.data.raw["Aim"]}</data>
      <data key="Attribute">${node.data.raw["Attribute"]}</data>
      <data key="Deontic">${node.data.raw["Deontic"]}</data>
    `);
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
    // TODO add edge color: actor=purple, outcome=green, sanction=red, conflict=red
    xmlParts.push(`
      <edge id="${edge.id}" source="${edge.source}" target="${edge.target}">
      <data key="driven_by">${edge.type}</data>
      </edge>
    `);
  }

  return generateGraphMLFile(xmlParts, `${projectName}.statements`);
}

function generateGraphMLFile(xmlParts: string[], projectName: string) {
  xmlParts.push("</graph></graphml>");

  const xmlString = xmlParts.join("");
  const file = new File([xmlString], `${projectName}.graphml`, {
    type: "application/xml",
  });
  return file;
}

function generateGraphMLHeader() {
  return [
    `<?xml version="1.0" encoding="UTF-8"?>
    <graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">',
    <key attr.name="label" attr.type="string" id="label" for="node"/>
    <key attr.name="x" attr.type="float" for="node" id="x" />
    <key attr.name="y" attr.type="float" for="node" id="y" />
  `,
  ];
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
    xmlParts.push(`
      <node id="${node.id}">
      <data key="label">${node.data.label}</data>
      <data key="x">${node.position.x}</data>
      <data key="y">${node.position.y}</data>
      <data key="ntype">${node.type}</data>
      <graph id="${node.id}:" edgedefault="undirected">
    `);
    for (const component of nodes.filter((n) => n.parentId === node.id)) {
      xmlParts.push(`
        <node id="${component.id}">
        <data key="label">${component.data.label}</data>
        <data key="x">${node.position.x + component.position.x}</data>
        <data key="y">${node.position.y + component.position.y}</data>
        <data key="ntype">${component.type}</data>
        </node>
      `);
    }
    for (const edge of edges.filter((e) => e.data?.statementId === node.id)) {
      xmlParts.push(
        `<edge id="${edge.id}" source="${edge.source}" target="${edge.target}">`,
      );
      if (edge.label) {
        xmlParts.push(`<data key="label">${edge.label}</data>`);
      }
      xmlParts.push(`
        <data key="etype">component</data>
        </edge>
      `);
    }
    xmlParts.push(`
      </graph>
      </node>
    `);
  }
  for (const edge of edges.filter((e) => !e.data?.statementId)) {
    xmlParts.push(`
      <edge id="${edge.id}" source="${edge.source}" target="${edge.target}">
      <data key="etype">${edge.type}</data>
      </edge>
    `);
  }

  return generateGraphMLFile(xmlParts, `${projectName}.components`);
}

// Need GEXF export format besides graphml as Gephi does not understand hierarchical graphs in GraphML
export function exportComponentNetworkToGEXF(
  projectName: string,
  nodes: INANode[],
  edges: INACEdge[],
) {
  const xmlParts: string[] = [];
  xmlParts.push(`<?xml version="1.0" encoding="UTF-8"?>
    <gexf xmlns="http://gexf.net/1.3" xmlns:viz="http://gexf.net/1.3/viz" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://gexf.net/1.3 http://gexf.net/1.3/gexf.xsd" version="1.3">
    <graph mode="static" defaultedgetype="directed">
    <attributes class="node">
    <attribute id="0" title="type" type="string"><default>statement</default></attribute>
    </attributes>
    <attributes class="edge">
    <attribute id="0" title="type" type="string"><default>component</default></attribute>
    </attributes>
    <nodes>
  `);

  for (const node of nodes) {
    if (node.parentId) {
      // Skip component nodes, they are added as part of their parent node
      continue;
    }
    xmlParts.push(`
      <node id="${node.id}" label="${node.data.label}">
      <viz:position x="${node.position.x}" y="${node.position.y}" z="0.0"/>
      <nodes>
    `);

    for (const component of nodes.filter((n) => n.parentId === node.id)) {
      xmlParts.push(`
        <node id="${component.id}" label="${component.data.label}">
        <attvalues>
        <attvalue for="0" value="${component.type}"/>
        </attvalues>
        <viz:position x="${node.position.x + component.position.x}" y="${node.position.y + component.position.y}" z="0.0"/>
        </node>
      `);
    }
    xmlParts.push("</nodes></node>");
  }

  xmlParts.push("</nodes><edges>");

  for (const edge of edges) {
    if (edge.label) {
      xmlParts.push(
        `<edge id="${edge.id}" source="${edge.source}" target="${edge.target}" label="${edge.label}">`,
      );
    } else {
      xmlParts.push(
        `<edge id="${edge.id}" source="${edge.source}" target="${edge.target}">`,
      );
    }
    if (edge.type !== "component") {
      xmlParts.push(
        `<attvalues><attvalue for="0" value="${edge.type}"/></attvalues>`,
      );
    }
    xmlParts.push("</edge>");
  }

  xmlParts.push("</edges></graph></gexf>");
  const xmlString = xmlParts.join("");
  const file = new File([xmlString], `${projectName}.components.gexf`, {
    type: "application/xml",
  });
  return file;
}

function statementSentence(statement: Statement) {
  let sentence = `${statement["Attribute"]} `;
  if (statement["Deontic"]) {
    sentence += `${statement["Deontic"]} `;
  }
  sentence += `${statement["Aim"]} `;
  if (statement["Direct Object"]) {
    sentence += `${statement["Direct Object"]} `;
  }
  if (statement["Indirect Object"]) {
    sentence += `to ${statement["Indirect Object"]} `;
  }
  if (statement["Activation Condition"]) {
    sentence += `${statement["Activation Condition"]} `;
  }
  if (statement["Execution Constraint"]) {
    sentence += `${statement["Execution Constraint"]} `;
  }
  if (statement["Or Else"]) {
    sentence += `${statement["Or Else"]}`;
  }
  return sentence;
}

export function exportStatementNetworkToGEXF(
  projectName: string,
  nodes: StatementNode[],
  edges: INASEdge[],
) {
  const xmlParts: string[] = [];
  xmlParts.push(`<?xml version="1.0" encoding="UTF-8"?>
    <gexf xmlns="http://gexf.net/1.3" xmlns:viz="http://gexf.net/1.3/viz" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://gexf.net/1.3 http://gexf.net/1.3/gexf.xsd" version="1.3">
    <graph mode="static" defaultedgetype="directed">
    <attributes class="node">
    <attribute id="0" title="sentence" type="string"></attribute>
    <attribute id="1" title="Statement Type" type="string"></attribute>
    <attribute id="2" title="Aim" type="string"></attribute>
    <attribute id="3" title="Attribute" type="string"></attribute>
    <attribute id="4" title="Deontic" type="string"></attribute>
    <attribute id="5" title="Direct Object" type="string"></attribute>
    <attribute id="6" title="Type of Direct_Object" type="string"></attribute>
    <attribute id="7" title="Indirect Object" type="string"></attribute>
    <attribute id="8" title="Type of Indirect Object" type="string"></attribute>
    <attribute id="9" title="Activation Condition" type="string"></attribute>
    <attribute id="10" title="Execution Constraint" type="string"></attribute>
    <attribute id="11" title="Or_Else" type="string"></attribute>
    </attributes>
    <attributes class="edge">
    <attribute id="0" title="type" type="string"></attribute>
    </attributes>
    <nodes>
  `);

  for (const node of nodes) {
    xmlParts.push(`
      <node id="${node.id}" label="${node.data.label}">
      <attvalues>
      <attvalue for="0" value="${statementSentence(node.data.raw)}"/>
      <attvalue for="1" value="${node.data.raw["Statement Type"]}"/>
      <attvalue for="2" value="${node.data.raw["Aim"]}"/>
      <attvalue for="3" value="${node.data.raw["Attribute"]}"/>
      <attvalue for="4" value="${node.data.raw["Deontic"]}"/>
      <attvalue for="5" value="${node.data.raw["Direct Object"]}"/>
      <attvalue for="6" value="${node.data.raw["Type of Direct Object"]}"/>
      <attvalue for="7" value="${node.data.raw["Indirect Object"]}"/>
      <attvalue for="8" value="${node.data.raw["Type of Indirect Object"]}"/>
      <attvalue for="9" value="${node.data.raw["Activation Condition"]}"/>
      <attvalue for="10" value="${node.data.raw["Execution Constraint"]}"/>
      <attvalue for="11" value="${node.data.raw["Or Else"]}"/>
      </attvalues>
      <viz:position x="${node.position.x}" y="${node.position.y}" z="0.0"/>
      </node>
    `);
  }

  xmlParts.push("</nodes><edges>");

  for (const edge of edges) {
    if (edge.label) {
      xmlParts.push(
        `<edge id="${edge.id}" source="${edge.source}" target="${edge.target}" label="${edge.label}">`,
      );
    } else {
      xmlParts.push(
        `<edge id="${edge.id}" source="${edge.source}" target="${edge.target}">`,
      );
    }
    xmlParts.push(`
      <attvalues>
      <attvalue for="0" value="${edge.type}"/>
      </attvalues>
      </edge>
    `);
  }

  xmlParts.push("</edges></graph></gexf>");
  const xmlString = xmlParts.join("");
  const file = new File([xmlString], `${projectName}.statements.gexf`, {
    type: "application/xml",
  });
  return file;
}
