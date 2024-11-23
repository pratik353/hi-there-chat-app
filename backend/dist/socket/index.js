"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const userManager_1 = require("./userManager");
const user_schema_1 = require("../models/user.schema");
const conversation_schema_1 = require("../models/conversation.schema");
const message_schema_1 = __importDefault(require("../models/message.schema"));
var SOCKET_EVENTS;
(function (SOCKET_EVENTS) {
    SOCKET_EVENTS["JOIN_ROOM"] = "joinroom";
    SOCKET_EVENTS["DISCONNECT"] = "disconnect";
    SOCKET_EVENTS["NEW_MESSAGE"] = "newmessage";
    SOCKET_EVENTS["ONLINE_USERS"] = "onlineusers";
    SOCKET_EVENTS["PREV_MESSAGES"] = "prevmessages";
    SOCKET_EVENTS["LEAVE_ROOM"] = "leaveroom";
})(SOCKET_EVENTS || (SOCKET_EVENTS = {}));
const port = 3000;
exports.app = (0, express_1.default)();
exports.server = http_1.default.createServer(exports.app);
// const wss = new WebSocketServer({ server: server });
const { Server } = require("socket.io");
const io = new Server(exports.server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
const onlineUser = new Set();
io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    const userRooms = [];
    const token = socket.handshake.auth.token;
    const socketId = socket.id;
    const user = yield user_schema_1.UserModel.findOne({
        token: token,
    }).select("-password");
    // console.log("user connected", user?.email);
    if (!user)
        return;
    let joinedUser = new userManager_1.User(socket, user);
    onlineUser.add(user._id);
    io.emit(SOCKET_EVENTS.ONLINE_USERS, Array.from(onlineUser).map((u) => u._id));
    socket.on("error", console.error);
    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
        console.log('disconnecting', joinedUser.user);
        console.log(joinedUser.user.email);
        onlineUser.delete(joinedUser.user._id);
        io.emit(SOCKET_EVENTS.ONLINE_USERS, Array.from(onlineUser).map((u) => u._id));
        socket.disconnect(true);
    });
    socket.on(SOCKET_EVENTS.PREV_MESSAGES, (conversationId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const messages = yield message_schema_1.default.find({
                conversation: conversationId,
            }).populate({
                path: "sender",
                select: ["name", "profilePic"], // Excludes the conversations field
            });
            if (!messages)
                return;
            io.to(conversationId).emit(SOCKET_EVENTS.PREV_MESSAGES, messages);
        }
        catch (error) {
            console.log("Socket Error:- ", error);
        }
    }));
    socket.on(SOCKET_EVENTS.LEAVE_ROOM, (conversationId) => __awaiter(void 0, void 0, void 0, function* () {
        socket.leave(conversationId);
    }));
    socket.on(SOCKET_EVENTS.NEW_MESSAGE, (event) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(event, "new-message");
        const { conversationId, message, type, mediaUrl } = event;
        if (!conversationId)
            return;
        const newMessage = new message_schema_1.default({
            conversation: conversationId,
            sender: joinedUser.user._id,
            text: message,
            videoUrl: type === "video" ? mediaUrl : "",
            imageUrl: type === "image" ? mediaUrl : "",
        });
        // Save the new message
        yield newMessage.save();
        // Update the conversation to include the new message
        yield conversation_schema_1.ConversationModel.findByIdAndUpdate(conversationId, {
            $push: { messages: newMessage._id },
        });
        // Fetch the conversation with populated messages
        const messages = yield message_schema_1.default.find({
            conversation: conversationId,
        }).populate({
            path: "sender",
            select: ["name", "profilePic"], // Excludes the conversations field
        });
        // console.log(conversation, "conversation");
        yield newMessage.save();
        if (!messages)
            return;
        console.log(io.sockets.adapter.rooms, "--rooms");
        io.to(conversationId).emit(SOCKET_EVENTS.PREV_MESSAGES, messages);
    }));
    // Room in socket.io
    socket.on(SOCKET_EVENTS.JOIN_ROOM, (conversationID) => {
        console.log("--->");
        console.log(conversationID, "join-room");
        userRooms.push(conversationID);
        socket.join(conversationID);
    });
}));
