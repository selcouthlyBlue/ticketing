import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import { NotFoundError, currentUser, errorHandler } from "@jpgtickets/common";
import cookieSession from "cookie-session";
import { createTicketRouter } from "./routes/new";
import { showTicketRouter } from "./routes/show";
import { indexTicketRouter } from "./routes";
import { updateTicketRouter } from "./routes/update";

const app = express();
// This is added to trust traffic from ingress-nginx
app.set("trust proxy", true);
app.use(json());
app.use(cookieSession({
  signed: false,
  secure: false
}))
app.use(currentUser);

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };


