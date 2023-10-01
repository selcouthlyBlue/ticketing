import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";

(async () => {
  console.log("starting up...");
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined");
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined");
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (e) {
    console.error(e);
  }

  try {
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL);
    (new OrderCreatedListener(natsWrapper.client)).listen();
    (new OrderCancelledListener(natsWrapper.client)).listen();
    const client = natsWrapper.client;
    client.on("close", () => {
      console.log("NATS connection closed!");
    });
    process.on("SIGINT", () => client.close());
    process.on("SIGTERM", () => client.close());

    console.log("Connected to NATS");
  } catch (e) {
    console.error(e);
  }

  const port = 3000;

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
})();
