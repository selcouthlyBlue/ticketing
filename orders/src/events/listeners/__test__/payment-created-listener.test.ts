import { OrderStatus, PaymentCreatedEvent } from "@jpgtickets/common";
import { natsWrapper } from "../../../nats-wrapper"
import { PaymentCreatedListener } from "../payment-created-listener"
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { Order } from "../../../models/order";

const setup = async () => {
  const listener = new PaymentCreatedListener(natsWrapper.client);
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 1000,
    title: "Concert"
  });
  await ticket.save();
  const order = Order.build({
    status: OrderStatus.AWAITING_PAYMENT,
    expiresAt: new Date(),
    ticket,
    userId: "1"
  })
  await order.save();
  const data: PaymentCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    chargeId: "some-id",
    orderId: order.id
  }

  // @ts-ignore
  const message: Message = {
    ack: jest.fn()
  }

  return { listener, data, message, order };
}

it("updates an order's status to complete", async () => {
  const { listener, data, message, order } = await setup();
  await listener.onMessage(data, message);
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder).toBeDefined();
  expect(updatedOrder!.status).toEqual(OrderStatus.COMPLETE);
})

it("acknowledges the message", async () => {
  const { listener, data, message } = await setup();
  await listener.onMessage(data, message);
  expect(message.ack).toHaveBeenCalled();
})
