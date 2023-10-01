import request from "supertest";
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order";
import mongoose from "mongoose";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("has a route handler listening to /api/orders for posts requests", async () => {
  const response = await request(app).post("/api/orders").send({});
  expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  return request(app).post("/api/orders").send({}).expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({});
  expect(response.status).not.toEqual(401);
});

it("returns an error if ticket does not exist", async () => {
  const nonExistentId = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: nonExistentId })
    .expect(404);
});

it("returns an error if ticket is already reserved", async () => {
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Eras Tour",
    price: 10000.0,
  };
  const ticket = Ticket.build(payload);
  await ticket.save();
  const order = Order.build({
    ticket: ticket,
    status: OrderStatus.CREATED,
    userId: "1",
    expiresAt: new Date(),
  });
  await order.save();
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("reserves a ticket", async () => {
  const numberOfOrders = await Order.count();
  expect(numberOfOrders).toEqual(0);
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Eras Tour",
    price: 10000.0,
  };
  const ticket = Ticket.build(payload);
  await ticket.save();
  const newOrder = await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  const orders = await Order.find({});
  expect(orders.length).toEqual(1);
  expect(orders[0].id).toEqual(newOrder.body.id);
});

it("publishes an event", async () => {
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Eras Tour",
    price: 10000.0,
  };
  const ticket = Ticket.build(payload);
  await ticket.save();
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
