import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  UnauthorizedError,
  requireAuth,
  validateRequest,
} from "@jpgtickets/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Order } from "../models/order";
import { stripe } from "../stripe";
import { Payment } from "../models/payment";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [
    body("token")
      .notEmpty({ ignore_whitespace: true })
      .withMessage("token must be provided"),
    body("orderId")
      .notEmpty({ ignore_whitespace: true })
      .withMessage("orderId must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId, token } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser?.id) {
      throw new UnauthorizedError();
    }
    if (order.status === OrderStatus.EXPIRED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestError("Cannot pay for a cancelled order");
    }
    const charge = await stripe.charges.create({
      amount: order.price * 100 ,
      currency: "usd",
      source: token
    });
    const payment = Payment.build({
      orderId: order.id,
      chargeId: charge.id
    });
    await payment.save();
    await (new PaymentCreatedPublisher(natsWrapper.client)).publish({
      id: payment.id,
      orderId: order.id,
      chargeId: charge.id
    })
    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
