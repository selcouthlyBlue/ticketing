import "bootstrap/dist/css/bootstrap.css";
import buildClient from "../api/build-client";
import Header from "./components/Header";

function AppComponent({ Component, pageProps, currentUser }) {
  return (
    <>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component {...pageProps} currentUser={currentUser} />
      </div>
    </>
  );
}

AppComponent.getInitialProps = async ({ Component, ctx: context }) => {
  try {
    const client = buildClient(context);
    const response = await client.get("/api/users/currentuser");
    if (Component.getInitialProps) {
      const pageProps = await Component.getInitialProps(
        context,
        client,
        response.data.currentUser
      );
      return {
        pageProps,
        ...response.data,
      };
    }
    return {
      pageProps: {},
      ...response.data,
    };
  } catch (e) {
    console.log(e);
    return { currentUser: null };
  }
};

export default AppComponent;
