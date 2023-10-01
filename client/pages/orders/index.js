import Orders from "../components/Orders";

const OrderHistory = ({ orders, currentUser }) => {
  if (!currentUser) {
    return <h1>You are not signed in</h1>;
  }
  return <Orders orders={orders} />;
};

OrderHistory.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get("/api/orders");
  return { orders: data, currentUser };
};

export default OrderHistory;
