import express from "express";
import http from "http";
import { UserModel } from "../models/user.schema";
import { Socket } from "socket.io";
import MessageModel from "../models/message.schema";
import { ConversationModel } from "../models/conversation.schema";

enum SOCKET_EVENTS {
  JOIN_ROOM = "joinroom",
  DISCONNECT = "disconnect",
  NEW_MESSAGE = "newmessage",
  ONLINE_USERS = "onlineusers",
  PREV_MESSAGES = "prevmessages",
  LEAVE_ROOM = "leaveroom",
  USER_NOT_IN_GROUP = "notaccess",
}

const port = 3000;

export const app = express();

export const server = http.createServer(app);

// const wss = new WebSocketServer({ server: server });

const { Server } = require("socket.io");

const io = new Server(server, {
  // cors: {
  //   origin: "*",
  //   methods: ["GET", "POST"],
  // },
});
const onlineUser = new Set();

io.on("connection", async (socket: Socket) => {
  const token = socket.handshake.auth.token;
  const socketId = socket.id;

  const user = await UserModel.findOne({
    token: token,
  }).select("-password");

  if (!user) return;

  onlineUser.add(user._id);

  io.emit(
    SOCKET_EVENTS.ONLINE_USERS,
    Array.from(onlineUser).map((u: any) => u._id)
  );

  socket.on("error", console.error);

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    onlineUser.delete(user._id);

    io.emit(
      SOCKET_EVENTS.ONLINE_USERS,
      Array.from(onlineUser).map((u: any) => u._id)
    );

    // leave all rooms after disconnected
    socket.rooms.forEach((room: string) => {
      socket.leave(room);
      socket.rooms.delete(room);
    });

    socket.disconnect(true);
  });

  // send previous messages to user
  socket.on(SOCKET_EVENTS.PREV_MESSAGES, async (conversationId) => {
    try {
      const messages = await MessageModel.find({
        conversation: conversationId,
      }).populate({
        path: "sender",
        select: ["name", "profilePic"], // Excludes the conversations field
      });

      if (!messages) return;

      io.to(conversationId).emit(SOCKET_EVENTS.PREV_MESSAGES, messages);
    } catch (error) {
      console.log("Socket Error:- ", error);
    }
  });

  // ADD NEW MESSAGE IN DB AND SEND TO ALL USERS IN ROOM
  socket.on(SOCKET_EVENTS.NEW_MESSAGE, async (event) => {
    const { conversationId, message, type, mediaUrl } = event;

    if (!conversationId) return;

    const userInConversation =  await ConversationModel.findOne({
      _id: conversationId,
      }).populate("participants");

    if(!userInConversation?.participants.map(u => u._id.toString()).includes(user._id.toString())) return console.log('Error: User does not have access ', user?.email, );

    const newMessage = new MessageModel({
      conversation: conversationId,
      sender: user._id,
      text: message,
      videoUrl: type === "video" ? mediaUrl : "",
      imageUrl: type === "image" ? mediaUrl : "",
    });

    // Save the new message
    await newMessage.save();

    // Fetch the conversation with populated messages
    const messages = await MessageModel.find({
      conversation: conversationId,
    }).populate({
      path: "sender",
      select: ["name", "profilePic"], // Excludes the conversations field
    });

    io.to(conversationId).emit(SOCKET_EVENTS.PREV_MESSAGES, messages);
  });

  // JOIN SOCKET ROOM
  socket.on(SOCKET_EVENTS.JOIN_ROOM, (conversationID) => {
    if (socket.rooms.has(conversationID)) return;

    socket.join(conversationID);
  });

  // leave SOCKET ROOM
  socket.on(SOCKET_EVENTS.LEAVE_ROOM, async (conversationId) => {
    if (socket.rooms.has(conversationId)) {
      socket.leave(conversationId);
      socket.rooms.delete(conversationId);
    }
  });
});
