import mongoose from "mongoose";

interface PaymentAttrs {
  orderId: string;
  chargeId: string;
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

interface PaymentDoc extends mongoose.Document {
  orderId: string;
  chargeId: string;
}

const paymentschema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    chargeId: {
      type: String,
      required: true,
    }
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    }
  }
);

paymentschema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>("Payment", paymentschema);

export { Payment };
