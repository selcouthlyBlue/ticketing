import { useRouter } from "next/navigation";
import useRequest from "../../hooks/useRequest";

function TicketDisplay({ ticket }) {
  const router = useRouter();
  const { doRequest, errors } = useRequest({
    url: "/api/orders",
    method: "post",
    body: {
      ticketId: ticket?.id,
    },
    onSuccess: (order) => {
      router.push(`/orders/${order.id}`);
    },
  });
  if (!ticket) {
    return <>loading...</>;
  }
  const isLocked = Boolean(ticket.orderId);
  return (
    <>
      <h1>{ticket.title}</h1>
      <h2>Price: {ticket.price}</h2>
      {errors}
      <button
        onClick={() => {doRequest()}}
        disabled={isLocked}
        className="btn btn-primary"
      >
        Purchase
      </button>
    </>
  );
}

TicketDisplay.getInitialProps = async (context, client) => {
  const { data } = await client.get(`/api/tickets/${context.query.ticketId}`);
  return { ticket: data };
};

export default TicketDisplay;
