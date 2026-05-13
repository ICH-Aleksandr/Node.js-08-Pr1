import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import User from "./models/User.js";
import { ValidationError } from "sequelize";

dotenv.config();

const app = express();
const port = process.env.PORT || 3333;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, Sequelize with Express!");
});

app.post("/users", async (req, res) => {
  try {
    const { name, email, age } = req.body;
    const user = await User.create({ name, email, age });
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const { limit = 10, offset = 0, isActive } = req.query;

    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const users = await User.findAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { name, email, age, isActive } = req.body;
    await user.update({ name, email, age, isActive });
    res.json(user);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const allowedFields = ["name", "email", "age", "isActive"];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    await user.update(updates);
    res.json(user);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await user.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection to the databasa established successfully.");
    console.log(`Server is running at http://127.0.0.1:${port}`);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
