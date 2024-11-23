import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { User } from "./userManager";
import url from "url";
import { UserModel } from "../models/user.schema";
import { decodeToken } from "../helper";
import { JwtPayload } from "jsonwebtoken";
import { Socket } from "socket.io";
import { ConversationModel } from "../models/conversation.schema";
import MessageModel from "../models/message.schema";

enum SOCKET_EVENTS {
  JOIN_ROOM = "joinroom",
  DISCONNECT = "disconnect",
  NEW_MESSAGE = "newmessage",
  ONLINE_USERS = "onlineusers",
  PREV_MESSAGES = "prevmessages",
  LEAVE_ROOM = "leaveroom",
}

const port = 3000;

export const app = express();

export const server = http.createServer(app);

// const wss = new WebSocketServer({ server: server });

const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const onlineUser = new Set();

io.on("connection", async (socket: Socket) => {
  const userRooms: string[] = [];
  const token = socket.handshake.auth.token;
  const socketId = socket.id;

  const user = await UserModel.findOne({
    token: token,
  }).select("-password");

  // console.log("user connected", user?.email);

  if (!user) return;

  let joinedUser = new User(socket, user);

  onlineUser.add(user._id);

  io.emit(
    SOCKET_EVENTS.ONLINE_USERS,
    Array.from(onlineUser).map((u: any) => u._id)
  );

  socket.on("error", console.error);

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    console.log('disconnecting', joinedUser.user)
    console.log(joinedUser.user.email);
    onlineUser.delete(joinedUser.user._id);

    io.emit(
      SOCKET_EVENTS.ONLINE_USERS,
      Array.from(onlineUser).map((u: any) => u._id)
    );
    socket.disconnect(true);
  });

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
      console.log("Socket Error:- ", error)      
    }
  });

  socket.on(SOCKET_EVENTS.LEAVE_ROOM, async (conversationId) => {
    socket.leave(conversationId);
  })

  socket.on(SOCKET_EVENTS.NEW_MESSAGE, async (event) => {
    console.log(event, "new-message");

    const { conversationId, message, type, mediaUrl } = event;

    if (!conversationId) return;

    const newMessage = new MessageModel({
      conversation: conversationId,
      sender: joinedUser.user._id,
      text: message,
      videoUrl: type === "video" ? mediaUrl : "",
      imageUrl: type === "image" ? mediaUrl : "",
    });

    // Save the new message
    await newMessage.save();

    // Update the conversation to include the new message
    await ConversationModel.findByIdAndUpdate(conversationId, {
      $push: { messages: newMessage._id },
    });

    // Fetch the conversation with populated messages
    const messages = await MessageModel.find({
      conversation: conversationId,
    }).populate({
      path: "sender",
      select: ["name", "profilePic"], // Excludes the conversations field
    });

    // console.log(conversation, "conversation");

    await newMessage.save();

    if (!messages) return;

    console.log(io.sockets.adapter.rooms, "--rooms");

    io.to(conversationId).emit(SOCKET_EVENTS.PREV_MESSAGES, messages);
  });

  // Room in socket.io
  socket.on(SOCKET_EVENTS.JOIN_ROOM, (conversationID) => {
    console.log("--->");
    console.log(conversationID, "join-room");
    userRooms.push(conversationID);
    socket.join(conversationID);
  });

});
