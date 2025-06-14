const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/model.user");

describe("auth endpoints", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_DB_URI)
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/auth/signup", () => {
    const validUser = {
      first_name: "Auth",
      last_name: "User",
      username: "authuser",
      email: "auth@example.com",
      password: "Password123!"
    };

    it("should create new user with valid data", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send(validUser);

      console.log("Signup Response:", res.body, "Status:", res.status);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("token") ;
      expect(res.body).toHaveProperty("user.email", validUser.email);
    });

    it("should reject duplicate  email", async () => {
      await User.create({
        first_name: "Test",
        last_name: "User",
        username: "testuser",
        email: "test@example.com",
        password: "Password123!"
      });

      const res = await request(app)
        .post("/api/auth/signup")
        .send({
        first_name: "Test",
        last_name: "User",
        username: "testuser",
        email: "test@example.com",
        password: "Password123!"
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Email already exists/);    
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/auth/signup")
        .send({
          first_name: "Test",
          last_name: "User",
          username: "testuser",
          email: "test@example.com",
          password: "Password123!"
        });
    });

    it("should login user with valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "Password123!"
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("should reject invalid password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword"
        });
      
        expect(res.statusCode).toBe(400);
    });
  });
});
