import { ExpirationCompleteEvent, OrderStatus } from "@jpgtickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { Order } from "../../../models/order";

const setup = async (status?: OrderStatus) => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    title: "concert",
  });
  await ticket.save();
  const order = Order.build({
    expiresAt: new Date(),
    status: status || OrderStatus.CREATED,
    ticket: ticket,
    userId: "1"
  });
  await order.save();
  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message, order };
};

it("updates an order's status to expired", async () => {
  const { data, listener, message, order } = await setup();
  await listener.onMessage(data, message);
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.EXPIRED);
});

it("publishes an event when an order expires", async () => {
  const { data, listener, message, order } = await setup();
  await listener.onMessage(data, message);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const orderCancellationParameters = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(orderCancellationParameters.id).toEqual(order.id);
})

it("acknowledges the message", async () => {
  const { listener, data, message } = await setup();
  await listener.onMessage(data, message);
  expect(message.ack).toHaveBeenCalled();
});

it("should not expire an already completed order", async () => {
  const { data, listener, message, order } = await setup(OrderStatus.COMPLETE);
  await listener.onMessage(data, message);
  const stillCompletedOrder = await Order.findById(order.id);
  expect(stillCompletedOrder!.status).toEqual(OrderStatus.COMPLETE);
  expect(message.ack).toHaveBeenCalled();
})
