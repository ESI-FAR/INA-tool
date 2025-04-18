import { reroute } from "./rerouter";

onmessage = async (event: MessageEvent) => {
  const { data } = event;
  const changes = await reroute(data);
  postMessage(changes);
};
