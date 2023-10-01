import { BadRequestError, NotFoundError, UnauthorizedError, requireAuth, validateRequest } from "@jpgtickets/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title")
      .notEmpty({ ignore_whitespace: true })
      .withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be valid"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      throw new NotFoundError();
    }
    if (`${req.currentUser!.id}` !== ticket.userId) {
      throw new UnauthorizedError();
    }
    if (ticket.orderId) {
      throw new BadRequestError("Cannot edit a reserved ticket");
    }
    const { title, price } = req.body;
    ticket.title = title;
    ticket.price = price;
    await ticket.save();
    ((new TicketUpdatedPublisher(natsWrapper.client)).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version
    }))
    res.send(ticket);
  }
);

export { router as updateTicketRouter };
