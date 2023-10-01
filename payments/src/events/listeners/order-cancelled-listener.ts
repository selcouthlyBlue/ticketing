import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from "@jpgtickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.ORDER_CANCELLED = Subjects.ORDER_CANCELLED;
  queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const order = await Order.findByPreviousVersion({ id: data.id, version: data.version });
    if (!order) {
      throw new Error("Order not found");
    }
    order.status = OrderStatus.CANCELLED;
    await order.save();
    msg.ack();
  }
}
