import {
  Listener,
  Subjects,
  TicketUpdatedEvent,
} from "@jpgtickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject: Subjects.TICKET_UPDATED = Subjects.TICKET_UPDATED;
  queueGroupName: string = queueGroupName;

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const ticket = await Ticket.findByPreviousVersion(data);
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    ticket.title = data.title;
    ticket.price = data.price;
    ticket.version = data.version;
    await ticket.save();
    msg.ack();
  }
}
