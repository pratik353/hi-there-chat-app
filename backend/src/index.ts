import express from "express";
import cors from "cors";
import userRouter from "./routes/user.routes";
import authRouter from "./routes/auth.routes";
import { connectDB } from "./db";
import { app, server } from "./socket";
import { conversationRouter } from "./routes/conversation.routes";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/status", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/conversation", conversationRouter);

app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

async function init() {
  await new Promise((resolve) => {
    // server.listen(80,/* "192.168.101.5" */, () => {
    server.listen(PORT, () => {
      console.log(`Example app listening at PORT:${PORT}`);
      resolve("");
    });
  });
  await connectDB();
}

init();
