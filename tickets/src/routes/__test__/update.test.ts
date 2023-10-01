import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";

it("can only be accessed if the user is signed in", async () => {
  const someId = new mongoose.Types.ObjectId().toHexString();
  await request(app).put(`/api/tickets/${someId}`).send().expect(401);
});

it("can only be accessed by the user who owns the ticket", async () => {
  const ticket = Ticket.build({
    title: "Eras Tour",
    price: 10000.0,
    userId: "1",
  });

  await ticket.save();
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", global.signin())
    .send({ title: "Taylor Sheesh Concert", price: 5000.0 })
    .expect(401);
});

it("returns a 404 if the ticket is not found", async () => {
  const nonExistentId = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${nonExistentId}`)
    .set("Cookie", global.signin())
    .send({ title: "validtitle", price: 10 })
    .expect(404);
});

it("returns an error if an invalid title or invalid price is provided", async () => {
  const someId = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${someId}`)
    .set("Cookie", global.signin())
    .send({
      title: "",
      price: 10,
    })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${someId}`)
    .set("Cookie", global.signin())
    .send({
      title: "validtitle",
      price: -10,
    })
    .expect(400);
});

it("should update the ticket's title and price", async () => {
  const userId = "1";
  const ticket = Ticket.build({
    title: "Eras Tour",
    price: 10000.0,
    userId,
  });
  await ticket.save();

  const updatedTicketDetails = {
    title: "Taylor Sheesh Concert",
    price: 5000.0,
  };
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", global.signin(userId))
    .send(updatedTicketDetails)
    .expect(200);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.title).toEqual(updatedTicketDetails.title);
  expect(updatedTicket!.price).toEqual(updatedTicketDetails.price);
});

it("publishes an event", async () => {
  const userId = "1";
  const ticket = Ticket.build({
    title: "Eras Tour",
    price: 10000.0,
    userId,
  });
  await ticket.save();

  const updatedTicketDetails = {
    title: "Taylor Sheesh Concert",
    price: 5000.0,
  };
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", global.signin(userId))
    .send(updatedTicketDetails)
    .expect(200);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("prevents a reserved ticket from being changed", async () => {
  const userId = "1";
  const ticket = Ticket.build({
    title: "Eras Tour",
    price: 10000.0,
    userId,
  });
  ticket.orderId = new mongoose.Types.ObjectId().toHexString();
  await ticket.save();
  const updatedTicketDetails = {
    title: "Taylor Sheesh Concert",
    price: 5000.0,
  };
  await request(app)
      .put(`/api/tickets/${ticket.id}`)
      .set("Cookie", global.signin(userId))
      .send(updatedTicketDetails)
      .expect(400);
});
