import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRouter from "./routes/auth.js";
import adminRouter from "./routes/admin/auth.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const DB_URL = process.env.DB_URL;

mongoose
  .connect(DB_URL)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

const app = express();
app.use(express.json());

app.use("/api", authRouter);
app.use("/api", adminRouter);

app.get("/api", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`serve at http://localhost:${PORT}`);
});
