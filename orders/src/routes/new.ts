import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@jpgtickets/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Order } from "../models/order";
import { Ticket } from "../models/ticket";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

const EXPIRATION_WINDOW = 5 * 60;

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .notEmpty({ ignore_whitespace: true })
      .withMessage("TicketId must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved");
    }
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW);
    const userId = req.currentUser!.id;
    const order = Order.build({
      expiresAt: expiration,
      userId: userId,
      ticket: ticketId,
      status: OrderStatus.CREATED
    });
    await order.save();
    await (new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: OrderStatus.CREATED,
      expiresAt: expiration.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price
      },
      userId: userId,
      version: order.version
    }))
    res.status(201).send(order);
  }
);

export { router as createOrderRouter };
