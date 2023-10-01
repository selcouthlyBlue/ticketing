import { ExpirationCompleteEvent, Publisher, Subjects } from "@jpgtickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.EXPIRATION_COMPLETE = Subjects.EXPIRATION_COMPLETE;
}
