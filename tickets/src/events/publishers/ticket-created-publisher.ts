import { Publisher, Subjects, TicketCreatedEvent } from "@jpgtickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TICKET_CREATED = Subjects.TICKET_CREATED;
}
