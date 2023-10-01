import axios from "axios";

export default function buildClient({ req }) {
  const isInServer = typeof window === "undefined";
  if (isInServer) {
    return axios.create({
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: req.headers,
    });
  }
  return axios.create({
    baseURL: "/",
  });
}
