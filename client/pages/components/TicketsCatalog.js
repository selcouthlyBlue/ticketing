import Link from "next/link";

export default function TicketsCatalog({ tickets }) {
  const catalog = tickets.map((ticket) => (
    <tr key={ticket.id}>
      <td>
        <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>{ticket.title}</Link>
      </td>
      <td>{ticket.price}</td>
    </tr>
  ));
  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>{catalog}</tbody>
      </table>
    </div>
  );
}
