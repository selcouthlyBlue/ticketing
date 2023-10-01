import { OrderCreatedEvent, OrderStatus } from "@jpgtickets/common";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from "../../../models/order";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const data: OrderCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.CREATED,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 10000,
    },
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date().toISOString(),
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
};

it("adds in order for payment", async () => {
  const { data, listener, message } = await setup();
  await listener.onMessage(data, message);
  const order = await Order.findById(data.id);
  expect(order!.price).toEqual(data.ticket.price);
});

it("acknowledges the message", async () => {
  const { listener, data, message } = await setup();
  await listener.onMessage(data, message);
  expect(message.ack).toHaveBeenCalled();
});
