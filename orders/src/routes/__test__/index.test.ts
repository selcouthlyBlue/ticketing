import request from "supertest";
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

it("has a route handler listening to /api/orders for posts requests", async () => {
  const response = await request(app).get("/api/orders").send({});
  expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  return request(app).get("/api/orders").send({}).expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
});

it("can fetch a list of orders made by a user", async () => {
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
    .get("/api/orders")
    .set("Cookie", global.signin(userId))
    .send()
    .expect(200);
  expect(response.body.length).toEqual(1);
  expect(response.body[0].userId).toEqual(userId);
  expect(response.body[0].id).toEqual(order.id);
});
