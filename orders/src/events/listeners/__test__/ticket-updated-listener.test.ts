import { TicketUpdatedEvent } from "@jpgtickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedListener } from "../ticket-updated-listener";

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    title: "concert",
  });
  await ticket.save();
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    title: "concert",
    version: ticket.version + 1,
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message, ticket };
};

it("updates a ticket", async () => {
  const { listener, data, message } = await setup();
  await listener.onMessage(data, message);
  const updatedTicket = await Ticket.findById(data.id);
  expect(updatedTicket).toBeDefined();
  console.log(updatedTicket);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("acknowledges the message", async () => {
  const { listener, data, message } = await setup();
  await listener.onMessage(data, message);
  expect(message.ack).toHaveBeenCalled();
});

it("does not acknowledge the message if the message has a skipped version", async () => {
  const { listener, data, message } = await setup();
  try {
    await listener.onMessage({ ...data, version: 10 }, message);
  } catch (e) {
    return;
  }
  throw new Error("Should not reach this point")
})
