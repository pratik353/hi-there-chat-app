import express from "express";
import cors from "cors";
import http from "http";
import userRouter from "./routes/user.routes";
import authRouter from "./routes/auth.routes";
import { connectDB } from "./db";
import { app, server } from "./socket";
import { conversationRouter } from "./routes/conversation.routes";

const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/conversation", conversationRouter);

async function init() {
  await new Promise((resolve) => {
    // server.listen(80,/* "192.168.101.5" */, () => {
    server.listen(3000, () => {
      console.log(`Example app listening at http://localhost:${port}`);
      resolve("");
    });
  });
  await connectDB();
}

init();
