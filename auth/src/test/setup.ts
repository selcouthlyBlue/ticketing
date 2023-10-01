import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app";

let mongo: MongoMemoryServer;

declare global {
  var signin: () => Promise<string[]>;
}

beforeAll(async () => {
  process.env.JWT_KEY = "somekey";
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
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

// It's okay to make it global here since
global.signin = async () => {
  const email = "valid@email.com";
  const password = "password";

  const response = await request(app).post("/api/users/signup").send({
    email,
    password,
  }).expect(201);

  const cookie = response.get("Set-Cookie");
  return cookie;
};
