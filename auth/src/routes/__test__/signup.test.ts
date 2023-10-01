import request from "supertest";
import { app } from "../../app";

it("returns a 201 on a successful signup", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "valid@email.com",
      password: "validpassword",
    })
    .expect(201);
});

it("returns a 400 with an invalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "invalidemail",
      password: "validpassword",
    })
    .expect(400);
});

it("returns a 400 with an invalid password", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "valid@email.com",
      password: "inv",
    })
    .expect(400);
});

it("returns a 400 with missing email and/or password", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "valid@email.com" })
    .expect(400);
  return request(app)
    .post("/api/users/signup")
    .send({ password: "validpassword" })
    .expect(400);
});

it("disallows duplicate emails", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "an@email.com", password: "validpassword1" })
    .expect(201);
  return request(app)
    .post("/api/users/signup")
    .send({ email: "an@email.com", password: "validpassword1" })
    .expect(400);
});

it("sets a cookie after successful signup", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email: "valid@email.com",
      password: "validpassword",
    })
    .expect(201);
  
  expect(response.get("Set-Cookie")).toBeDefined();
});
