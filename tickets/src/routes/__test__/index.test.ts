import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

const createTicket = async () => {
  const payload = {
    title: "Eras Tour",
    price: 10000.00,
    userId: "1"
  };
  const ticket = Ticket.build(payload)
  await ticket.save();
}

it("can fetch a list of tickets", async () => {
  await createTicket();
  await createTicket();
  await createTicket();
  const response = await request(app).get("/api/tickets").send().expect(200);
  expect(response.body.length).toEqual(3);
})
