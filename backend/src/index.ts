import express, { Request, Response } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { userModel } from "./db";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { z } from "zod";
import { authMiddleware } from "./middleware";

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/authentication")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.post("/register", async (req, res) => {
  const { name, password, email, dateofbirth } = req.body;

  const ZodDateFromString = z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .transform((val) => new Date(val));

  const userSchema = z.object({
    name: z.string().min(3).max(20),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/[a-z]/, "Must include a lowercase letter")
      .regex(/[0-9]/, "Must include a number")
      .regex(/[^A-Za-z0-9]/, "Must include a special character"),
    email: z.string().email(),
    dateofbirth: ZodDateFromString,
  });

  const isValidated = userSchema.safeParse({
    name,
    password,
    email,
    dateofbirth,
  });

  if (!isValidated.success) {
    res.status(400).json({ error: isValidated.error.errors });
    return;
  }

  const existingUser = await userModel.findOne({ name });
  if (existingUser) {
    res.status(400).json({ error: "User already exists" });
    return;
  }
  if (name && password && email && dateofbirth) {
    const newUser = new userModel({ name, password, email, dateofbirth });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } else {
    res.status(400).json({ error: "Invalid data" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const loginSchema = z.object({
    email: z.string().email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/[a-z]/, "Must include a lowercase letter")
      .regex(/[0-9]/, "Must include a number")
      .regex(/[^A-Za-z0-9]/, "Must include a special character"),
  });

  const isValidated = loginSchema.safeParse({ email, password });

  if (!isValidated.success) {
    res.status(400).json({ error: isValidated.error.errors });
    return;
  }

  const user = await userModel.findOne({ email, password });
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  } else {
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET!
    );
    res.status(200).json({ token });
  }
});

app.get("/", authMiddleware, async (req, res) => {
  const users = [
    {
      name: "micheal holz",
      dateCreated: "10/03/2025 ",
      role: "admin",
      status: "active",
    },
    {
      name: "paula wilson",
      dateCreated: "15/08/2013 ",
      role: "publisher",
      status: "inactive",
    },
    {
      name: "james smith",
      dateCreated: "20/01/2020 ",
      role: "editor",
      status: "suspended",
    },
    {
      name: "sarah johnson",
      dateCreated: "25/12/2018 ",
      role: "admin",
      status: "active",
    },
    {
      name: "david brown",
      dateCreated: "30/06/2015 ",
      role: "publisher",
      status: "inactive",
    },
    {
      name: "emily jones",
      dateCreated: "05/11/2021 ",
      role: "editor",
      status: "suspended",
    },
    {
      name: "michael garcia",
      dateCreated: "10/03/2022 ",
      role: "admin",
      status: "active",
    },
    {
      name: "jessica martinez",
      dateCreated: "15/08/2019 ",
      role: "publisher",
      status: "inactive",
    },
    {
      name: "william lopez",
      dateCreated: "20/01/2021 ",
      role: "editor",
      status: "suspended",
    },
    {
      name: "olivia gonzalez",
      dateCreated: "25/12/2020 ",
      role: "admin",
      status: "active",
    },
    {
      name: "james wilson",
      dateCreated: "30/06/2017 ",
      role: "publisher",
      status: "inactive",
    },
    {
      name: "sophia taylor",
      dateCreated: "05/11/2018 ",
      role: "editor",
      status: "suspended",
    },
    {
      name: "benjamin thomas",
      dateCreated: "10/03/2016 ",
      role: "admin",
      status: "active",
    },
  ];
  res.json(users);
});

app.listen(PORT, () => {
  console.log(`Server is running on port : ${PORT}`);
});
