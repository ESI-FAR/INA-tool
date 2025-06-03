import { findConnections } from "@/nlp/connectionFinding";

onmessage = async (event: MessageEvent) => {
  const { payload, action } = event.data;
  if (action !== "findConnections") {
    throw new Error(`Unknown action: ${action}`);
  }
  const connections = await findConnections(payload);
  postMessage(connections);
};
