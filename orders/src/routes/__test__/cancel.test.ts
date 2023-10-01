import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("returns a 404 if the order is not found", async () => {
  const nonExistentId = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .delete(`/api/orders/${nonExistentId}`)
    .set("Cookie", global.signin())
    .send()
    .expect(404);
});

it("cannot be cancelled by a user who did not make the order", async () => {
  const numberOfOrders = await Order.count();
  expect(numberOfOrders).toEqual(0);
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Eras Tour",
    price: 10000.0,
  };
  const ticket = Ticket.build(payload);
  await ticket.save();
  const userId = "1";
  const order = Order.build({
    ticket: ticket,
    status: OrderStatus.CREATED,
    userId: userId,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", global.signin("2"))
    .send()
    .expect(401);
});

it("cancel the order", async () => {
  const numberOfOrders = await Order.count();
  expect(numberOfOrders).toEqual(0);
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Eras Tour",
    price: 10000.0,
  };
  const ticket = Ticket.build(payload);
  await ticket.save();
  const userId = "1";
  const order = Order.build({
    ticket: ticket,
    status: OrderStatus.CREATED,
    userId: userId,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", global.signin(userId))
    .send()
    .expect(200);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.CANCELLED);
});

it("publishes an event", async () => {
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Eras Tour",
    price: 10000.0,
  };
  const ticket = Ticket.build(payload);
  await ticket.save();
  const userId = "1";
  const order = Order.build({
    ticket: ticket,
    status: OrderStatus.CREATED,
    userId: userId,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", global.signin(userId))
    .send()
    .expect(200);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
 