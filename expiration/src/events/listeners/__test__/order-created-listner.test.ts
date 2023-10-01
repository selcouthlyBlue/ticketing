import { OrderCreatedEvent, OrderStatus } from "@jpgtickets/common";
import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const data: OrderCreatedEvent["data"] = {
    version: 0,
    id: "orderId",
    status: OrderStatus.CREATED,
    ticket: {
      id: "ticketId",
      price: 10,
    },
    userId: "userId",
    expiresAt: new Date().toISOString(),
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
};

it("acknowledges the message", async () => {
  const { listener, data, message } = await setup();
  await listener.onMessage(data, message);
  expect(message.ack).toHaveBeenCalled();
});
