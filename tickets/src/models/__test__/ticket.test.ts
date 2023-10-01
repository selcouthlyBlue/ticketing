import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async () => {
  const ticket = Ticket.build({ price: 10, title: "Test", userId: "1" });
  await ticket.save();

  const ticket1 = await Ticket.findById(ticket.id);
  const ticket2 = await Ticket.findById(ticket.id);
  
  ticket1!.title = "Updated title";
  ticket1!.price = 11;

  ticket2!.title = "Updated title";
  ticket2!.price = 11;

  await ticket1?.save();
  try {
    await ticket2?.save();
  } catch (err) {
    return;
  }

  throw new Error("Should not reach this point");
});

it("increments the version number on multiple saves", async () => {
  const ticket = Ticket.build({ price: 10, title: "Test", userId: "1" });
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  const ticket1 = await Ticket.findById(ticket.id);
  ticket1!.title = "new title";
  ticket1!.price = 11;
  await ticket1?.save();
  expect(ticket1?.version).toEqual(1);
  ticket1!.title = "new title 2";
  ticket1!.price = 12;
  await ticket1?.save();
  expect(ticket1?.version).toEqual(2);
})
