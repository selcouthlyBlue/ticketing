import {
  Listener,
  Subjects,
  ExpirationCompleteEvent,
  NotFoundError,
  OrderStatus,
} from "@jpgtickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject: Subjects.EXPIRATION_COMPLETE = Subjects.EXPIRATION_COMPLETE;
  queueGroupName: string = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId).populate("ticket");
    if (!order) {
      throw new Error("Order not found");
    }
    if (order.status === OrderStatus.COMPLETE || order.status === OrderStatus.CANCELLED || order.status === OrderStatus.EXPIRED) {
      return msg.ack();
    }
    order.status = OrderStatus.EXPIRED;
    await order.save();
    await (new OrderCancelledPublisher(this.client)).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id
      }
    })
    msg.ack();
  }
}
