// app.js will setup Express app aka server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import db from "./db/db.js";

// Import all routes here later.
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import BMRoutes from "./routes/BMRoutes.js";
import SARoutes from "./routes/SARoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// attach db to req for easy access in routes
app.locals.db = db;
app.use((req, _res, next) => {
  Object.defineProperty(req, "db", {
    value: db,
    writable: false,
    enumerable: false,
    configurable: false,
  });
  next();
});

// Define and list routes here from imported route files later.
app.use("/", authRoutes);
app.use("/", cartRoutes);
app.use("/", orderRoutes);
app.use("/", userRoutes);
app.use('/', BMRoutes);
app.use('/', SARoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

export default app;
