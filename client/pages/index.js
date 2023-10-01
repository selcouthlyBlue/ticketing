import TicketsCatalog from "./components/TicketsCatalog";

function Home({ currentUser, tickets }) {
  if (currentUser) {
    return (
      <TicketsCatalog tickets={tickets} />
    );
  }
  return <h1>You are not signed in</h1>;
}

Home.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get("/api/tickets");
  return { tickets: data };
};

export default Home;
