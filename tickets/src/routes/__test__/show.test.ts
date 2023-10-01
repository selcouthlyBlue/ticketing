import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

it("returns a 404 if the ticket is not found", async () => {
  const nonExistentId = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .get(`/api/tickets/${nonExistentId}`)
    .send()
    .expect(404);
});

it("returns the ticket if the ticket is found", async () => {
  const payload = {
    title: "Eras Tour",
    price: 10000.00,
    userId: "1"
  };
  const ticket = Ticket.build(payload)
  await ticket.save();

  const response = await request(app)
    .get(`/api/tickets/${ticket.id}`)
    .send()
    .expect(200);

  expect(response.body.title).toEqual(payload.title);
  expect(response.body.price).toEqual(payload.price);
});
