import axios from "axios";

export default function buildClient({ req }) {
  const isInServer = typeof window === "undefined";
  if (isInServer) {
    return axios.create({
      baseURL:
        "http://www.ticketverse.shop",
      headers: req.headers,
    });
  }
  return axios.create({
    baseURL: "/",
  });
}
