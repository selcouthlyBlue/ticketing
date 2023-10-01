import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

let mongo: MongoMemoryServer;

jest.mock("../nats-wrapper");

declare global {
  var signin: (id?: string) => string[];
}

beforeAll(async () => {
  process.env.JWT_KEY = "somekey";
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = (id) => {
  const session = {
    jwt: jwt.sign(
      { id: id || "asdfg", email: "valid@email.com" },
      process.env.JWT_KEY!
    ),
  };
  const base64 = Buffer.from(JSON.stringify(session)).toString("base64");
  return [`session=${base64}`];
};
