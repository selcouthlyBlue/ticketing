import mongoose from "mongoose";
import { app } from "./app";

(async () => {
  console.log("starting up...")
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (e) {
    console.error(e);
  }

  const port = 3000;

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
})();
