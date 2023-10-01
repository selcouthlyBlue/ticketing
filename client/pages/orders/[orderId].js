import { useRouter } from "next/navigation";
import useRequest from "../../hooks/useRequest";
import { useEffect, useState } from "react";
import CheckoutForm from "../components/CheckoutForm";

function OrderDisplay({ currentUser, order }) {
  const router = useRouter();
  const { doRequest: cancelOrder, errors } = useRequest({
    url: `/api/orders/${order?.id}`,
    method: "delete",
    onSuccess: () => {
      router.push("/orders");
    },
  });
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const getTimeLeft = () => {
      const timeLeft = (new Date(order.expiresAt) - new Date()) / 1000;
      setTimeLeft(Math.round(timeLeft));
    };
    getTimeLeft();
    const timerId = setInterval(getTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if (!currentUser) {
    return <h1>You are not signed in</h1>;
  }
  if (!order) {
    return <>loading...</>;
  }
  if (timeLeft < 0) {
    return <h1>"{order.ticket.title}" Order Expired</h1>;
  }
  if (order.status === "CANCELLED") {
    return <h1>"{order.ticket.title}" Order Cancelled</h1>;
  }

  return (
    <>
      <h1>
        Purchasing {order.ticket.title} Price: $
        {order.ticket.price}
      </h1>
      <p>Time left to pay: {timeLeft} second(s)</p>
      {errors}
      <CheckoutForm
        order={order}
        email={currentUser.email}
      />
      <button
        type="button"
        onClick={cancelOrder}
        className="btn btn-danger"
      >
        Cancel
      </button>
    </>
  );
}

OrderDisplay.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get(`/api/orders/${context.query.orderId}`);
  return { order: data, currentUser };
};

export default OrderDisplay;
