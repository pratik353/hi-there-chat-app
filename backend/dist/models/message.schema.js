"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    text: {
        type: String,
        default: "",
    },
    imageUrl: {
        type: String,
        default: "",
    },
    videoUrl: {
        type: String,
        default: "",
    },
    seen: {
        type: Boolean,
        default: false,
    },
    sender: {
        type: mongoose_1.default.Schema.ObjectId,
        required: true,
        ref: "User",
    },
    conversation: {
        type: mongoose_1.default.Schema.ObjectId,
        required: true,
        ref: "Conversation",
    },
}, {
    timestamps: true,
});
const MessageModel = mongoose_1.default.model("Message", messageSchema);
exports.default = MessageModel;
