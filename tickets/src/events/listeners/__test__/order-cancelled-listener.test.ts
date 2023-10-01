import { OrderCancelledEvent, OrderStatus } from "@jpgtickets/common";
import { OrderCancelledListener } from "../order-cancelled-listener";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const owner = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: "concert",
    price: 10,
    userId: owner,
  });
  const orderId = new mongoose.Types.ObjectId().toHexString();
  ticket.orderId = orderId;
  await ticket.save();
  
  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    ticket: {
      id: ticket.id
    },
    version: 0
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message, ticket };
};

it("cancels an order for a ticket", async () => {
  const { data, listener, message, ticket } = await setup();
  await listener.onMessage(data, message);
  const unreservedTicket = await Ticket.findById(ticket.id);
  expect(unreservedTicket!.orderId).toBeUndefined();
});

it("publishes an event when an order is cancelled", async () => {
  const { data, listener, message } = await setup();
  await listener.onMessage(data, message);
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const updatedTicket = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(updatedTicket.orderId).toBeUndefined();
});

it("acknowledges the message", async () => {
  const { listener, data, message } = await setup();
  await listener.onMessage(data, message);
  expect(message.ack).toHaveBeenCalled();
});
