import { OrderCreatedEvent, OrderStatus } from "@jpgtickets/common";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const owner = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: "concert",
    price: 10,
    userId: owner,
  });
  await ticket.save();
  const buyer = new mongoose.Types.ObjectId().toHexString();
  const data: OrderCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.CREATED,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
    userId: buyer,
    expiresAt: new Date().toISOString(),
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message, ticket };
};

it("reserves a ticket for ordering", async () => {
  const { data, listener, message, ticket } = await setup();
  await listener.onMessage(data, message);
  const reservedTicket = await Ticket.findById(ticket.id);
  expect(reservedTicket!.orderId).toEqual(data.id);
});

it("publishes an event when an order is created", async () => {
  const { data, listener, message } = await setup();
  await listener.onMessage(data, message);
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const updatedTicket = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(data.id).toEqual(updatedTicket.orderId);
});

it("does not reserve a ticket that is already reserved when ordering", async () => {
  const { data, listener, message } = await setup();
  await listener.onMessage(data, message);
  try {
    await listener.onMessage(data, message);
  } catch (e) {
    return;
  }
  throw new Error(
    "Should throw an error saying that ticket is already reserved"
  );
});

it("acknowledges the message", async () => {
  const { listener, data, message } = await setup();
  await listener.onMessage(data, message);
  expect(message.ack).toHaveBeenCalled();
});
