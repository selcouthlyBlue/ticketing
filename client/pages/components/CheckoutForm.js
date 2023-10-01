import React from "react";
import useRequest from "../../hooks/useRequest";
import { useRouter } from "next/navigation";
import StripeCheckout from "react-stripe-checkout";

const CheckoutForm = ({ order, email }) => {
  const router = useRouter();

  const { doRequest: pay, errors } = useRequest({
    url: `/api/payments`,
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: () => {
      router.push("/orders");
    },
  });

  return (
    <>
      {errors}
      <StripeCheckout
        token={(token) => {
          pay({ token: token.id });
        }}
        stripeKey={
          "pk_test_51Nu8cWK8fOuU90tHmyuJidiuE87AIi60FQbOcSh0UToOCIAvlXyIVB88ASctU8LdW8TvePYhCKXfPxUJeszCSMqR00389o860f"
        }
        amount={order.ticket.price * 100}
        email={email}
        ComponentClass="btn btn-primary"
      />
    </>
  );
};

export default CheckoutForm;
