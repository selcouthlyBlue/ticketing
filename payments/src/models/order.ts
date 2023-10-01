import { OrderStatus } from "@jpgtickets/common";
import mongoose from "mongoose";

export { OrderStatus }

interface OrderAttrs {
  id: string;
  version: number;
  userId: string;
  status: OrderStatus;
  price: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
  findByPreviousVersion(criteria: {
    id: string;
    version: number;
  }): Promise<OrderDoc | null>;
}

interface OrderDoc extends mongoose.Document {
  version: number;
  userId: string;
  status: OrderStatus;
  price: number;
}

const orderschema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
    versionKey: "version",
    optimisticConcurrency: true,
  }
);

orderschema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    version: attrs.version,
    price: attrs.price,
    userId: attrs.userId,
    status: attrs.status,
  });
};

orderschema.statics.findByPreviousVersion = (criteria: {
  id: string;
  version: number;
}) => {
  return Order.findOne({ _id: criteria.id, version: criteria.version - 1 });
};

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderschema);

export { Order };
