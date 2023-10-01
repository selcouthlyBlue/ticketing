import Link from "next/link";

export default function Orders({ orders }) {
  const catalog = orders.map((order) => (
    <tr key={order.id}>
      <td>
        <Link href="/orders/[orderId]" as={`/orders/${order.id}`}>
          View
        </Link>
      </td>
      <td>{order.ticket.title}</td>
      <td>{order.status}</td>
    </tr>
  ));
  return (
    <div>
      <h1>Orders</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Link</th>
            <th>Ticket Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>{catalog}</tbody>
      </table>
    </div>
  );
}
