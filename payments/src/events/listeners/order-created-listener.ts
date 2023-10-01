import { Listener, OrderCreatedEvent, Subjects } from "@jpgtickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.ORDER_CREATED = Subjects.ORDER_CREATED;
  queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const {
      id,
      status,
      version,
      userId,
      ticket: { price },
    } = data;
    const order = Order.build({
      id,
      price,
      status,
      userId,
      version,
    });
    await order.save();
    msg.ack();
  }
}
