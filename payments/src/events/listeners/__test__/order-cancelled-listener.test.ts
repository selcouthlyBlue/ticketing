import { OrderCancelledEvent, OrderStatus } from "@jpgtickets/common";
import { OrderCancelledListener } from "../order-cancelled-listener";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from "../../../models/order";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10000,
    status: OrderStatus.AWAITING_PAYMENT,
    userId: "1",
    version: 0
  })
  await order.save();
  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString()
    },
    version: 1
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message, order };
};

it("cancels an order", async () => {
  const { data, listener, message, order } = await setup();
  await listener.onMessage(data, message);
  const cancelledOrder = await Order.findById(order.id);
  expect(cancelledOrder!.status).toEqual(OrderStatus.CANCELLED);
});

it("acknowledges the message", async () => {
  const { listener, data, message } = await setup();
  await listener.onMessage(data, message);
  expect(message.ack).toHaveBeenCalled();
});
