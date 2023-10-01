import request from "supertest";
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order";
import mongoose from "mongoose";
import { Ticket } from "../../models/ticket";

it("returns a 404 if the order is not found", async () => {
  const nonExistentId = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .get(`/api/orders/${nonExistentId}`)
    .set("Cookie", global.signin())
    .send()
    .expect(404);
});

it("cannot be accessed by the user who did not make the order", async () => {
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

  await request(app).get(`/api/orders/${order.id}`).set("Cookie", global.signin("2")).send().expect(401);
});

it("returns the order if the order is found", async () => {
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

  const response = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", global.signin(userId))
    .send()
    .expect(200);

  expect(response.body.id).toEqual(order.id);
  expect(response.body.ticket.id).toEqual(order.ticket.id);
});
