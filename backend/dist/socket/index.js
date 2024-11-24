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
const user_schema_1 = require("../models/user.schema");
const message_schema_1 = __importDefault(require("../models/message.schema"));
const conversation_schema_1 = require("../models/conversation.schema");
var SOCKET_EVENTS;
(function (SOCKET_EVENTS) {
    SOCKET_EVENTS["JOIN_ROOM"] = "joinroom";
    SOCKET_EVENTS["DISCONNECT"] = "disconnect";
    SOCKET_EVENTS["NEW_MESSAGE"] = "newmessage";
    SOCKET_EVENTS["ONLINE_USERS"] = "onlineusers";
    SOCKET_EVENTS["PREV_MESSAGES"] = "prevmessages";
    SOCKET_EVENTS["LEAVE_ROOM"] = "leaveroom";
    SOCKET_EVENTS["USER_NOT_IN_GROUP"] = "notaccess";
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
    const token = socket.handshake.auth.token;
    const socketId = socket.id;
    const user = yield user_schema_1.UserModel.findOne({
        token: token,
    }).select("-password");
    if (!user)
        return;
    onlineUser.add(user._id);
    io.emit(SOCKET_EVENTS.ONLINE_USERS, Array.from(onlineUser).map((u) => u._id));
    socket.on("error", console.error);
    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
        onlineUser.delete(user._id);
        io.emit(SOCKET_EVENTS.ONLINE_USERS, Array.from(onlineUser).map((u) => u._id));
        // leave all rooms after disconnected
        socket.rooms.forEach((room) => {
            socket.leave(room);
            socket.rooms.delete(room);
        });
        socket.disconnect(true);
    });
    // send previous messages to user
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
    // ADD NEW MESSAGE IN DB AND SEND TO ALL USERS IN ROOM
    socket.on(SOCKET_EVENTS.NEW_MESSAGE, (event) => __awaiter(void 0, void 0, void 0, function* () {
        const { conversationId, message, type, mediaUrl } = event;
        if (!conversationId)
            return;
        const userInConversation = yield conversation_schema_1.ConversationModel.findOne({
            _id: conversationId,
        }).populate("participants");
        if (!(userInConversation === null || userInConversation === void 0 ? void 0 : userInConversation.participants.map(u => u._id.toString()).includes(user._id.toString())))
            return console.log('Error: User does not have access ', user === null || user === void 0 ? void 0 : user.email);
        const newMessage = new message_schema_1.default({
            conversation: conversationId,
            sender: user._id,
            text: message,
            videoUrl: type === "video" ? mediaUrl : "",
            imageUrl: type === "image" ? mediaUrl : "",
        });
        // Save the new message
        yield newMessage.save();
        // Fetch the conversation with populated messages
        const messages = yield message_schema_1.default.find({
            conversation: conversationId,
        }).populate({
            path: "sender",
            select: ["name", "profilePic"], // Excludes the conversations field
        });
        io.to(conversationId).emit(SOCKET_EVENTS.PREV_MESSAGES, messages);
    }));
    // JOIN SOCKET ROOM
    socket.on(SOCKET_EVENTS.JOIN_ROOM, (conversationID) => {
        if (socket.rooms.has(conversationID))
            return;
        socket.join(conversationID);
    });
    // leave SOCKET ROOM
    socket.on(SOCKET_EVENTS.LEAVE_ROOM, (conversationId) => __awaiter(void 0, void 0, void 0, function* () {
        if (socket.rooms.has(conversationId)) {
            socket.leave(conversationId);
            socket.rooms.delete(conversationId);
        }
    }));
}));
