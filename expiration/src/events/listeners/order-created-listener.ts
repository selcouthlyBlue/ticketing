import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from "@jpgtickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListner extends Listener<OrderCreatedEvent> {
  subject: Subjects.ORDER_CREATED = Subjects.ORDER_CREATED;
  queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    await expirationQueue.add(
      { orderId: data.id },
      {
        delay,
      }
    );
    msg.ack();
  }
}