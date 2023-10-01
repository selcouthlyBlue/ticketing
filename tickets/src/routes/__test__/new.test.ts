import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("has a route handler listening to /api/tickets for posts requests", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  return request(app).post("/api/tickets").send({}).expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({});
  expect(response.status).not.toEqual(401);
});

it("returns an error if an invalid title is provided", async () => {
  const cookie = global.signin();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: " ",
      price: 10,
    })
    .expect(400);
});

it("returns an error if an invalid price is provided", async () => {
  const cookie = global.signin();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "validtitle",
      price: -10,
    })
    .expect(400);
});

it("creates a ticket with valid inputs", async () => {
  const numberOfTickets = await Ticket.count();
  expect(numberOfTickets).toEqual(0);
  const payload = {
    title: "validtitle",
    price: 10,
  };
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send(payload)
    .expect(201);
  const tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].title).toEqual(payload.title);
});

it("publishes an event", async () => {
  const payload = {
    title: "validtitle",
    price: 10,
  };
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send(payload)
    .expect(201);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
