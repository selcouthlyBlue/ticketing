import { NotFoundError, OrderStatus, UnauthorizedError, requireAuth } from "@jpgtickets/common";
import express, { Request, Response } from "express";
import { Order } from "../models/order";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.delete(
  "/api/orders/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id).populate("ticket");
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new UnauthorizedError();
    }
    order.status = OrderStatus.CANCELLED;
    await order.save();
    await (new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id
      }
    }))
    res.send({});
  }
);

export { router as cancelOrderRouter };
