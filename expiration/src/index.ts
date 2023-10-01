import { OrderCreatedListner } from "./events/listeners/order-created-listener";
import { natsWrapper } from "./nats-wrapper";

(async () => {
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined");
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined");
  }
  if (!process.env.REDIS_HOST) {
    throw new Error("REDIS_HOST must be defined");
  }

  try {
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL);
    const client = natsWrapper.client;
    client.on("close", () => {
      console.log("NATS connection closed!");
    });
    process.on("SIGINT", () => client.close());
    process.on("SIGTERM", () => client.close());

    console.log("Connected to NATS");
    (new OrderCreatedListner(natsWrapper.client)).listen();
  } catch (e) {
    console.error(e);
  }
})();
