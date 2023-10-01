import { Publisher, Subjects, TicketUpdatedEvent } from "@jpgtickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TICKET_UPDATED = Subjects.TICKET_UPDATED;
}
