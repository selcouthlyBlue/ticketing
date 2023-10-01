import request from "supertest";
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order";
import mongoose from "mongoose";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";
import { natsWrapper } from "../../nats-wrapper";

jest.mock("../../stripe");

it("has a route handler listening to /api/payments for posts requests", async () => {
  const response = await request(app).post("/api/payments").send({});
  expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  return request(app).post("/api/payments").send({}).expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({});
  expect(response.status).not.toEqual(401);
});

it("returns an error if order does not exist", async () => {
  const nonExistentId = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({ token: "sometoken", orderId: nonExistentId })
    .expect(404);
});

it("returns an error if paying for an order of another user", async () => {
  const order = Order.build({
    price: 10000,
    status: OrderStatus.CREATED,
    userId: new mongoose.Types.ObjectId().toHexString(),
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });
  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({ token: "sometoken", orderId: order.id })
    .expect(401);
});

it("returns an error if order is already expired", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const cookie = global.signin(userId);
  const order = Order.build({
    price: 10000,
    status: OrderStatus.EXPIRED,
    userId,
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });
  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({ token: "sometoken", orderId: order.id })
    .expect(400);
});

it("returns an error if order is already cancelled", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const cookie = global.signin(userId);
  const order = Order.build({
    price: 10000,
    status: OrderStatus.EXPIRED,
    userId,
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });
  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({ token: "sometoken", orderId: order.id })
    .expect(400);
});

it("creates a charge", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const cookie = global.signin(userId);
  const order = Order.build({
    price: 10000,
    status: OrderStatus.AWAITING_PAYMENT,
    userId,
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });
  await order.save();
  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({ token: "tok_visa", orderId: order.id })
    .expect(201);
  
  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions.source).toEqual("tok_visa");
  expect(chargeOptions.amount).toEqual(order.price * 100);
  expect(chargeOptions.currency).toEqual("usd");

  const payment = await Payment.findById(response.body.id);
  expect(payment).not.toBeNull();
});

it("publishes an event", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const cookie = global.signin(userId);
  const order = Order.build({
    price: 10000,
    status: OrderStatus.AWAITING_PAYMENT,
    userId,
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });
  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({ token: "tok_visa", orderId: order.id })
    .expect(201);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
