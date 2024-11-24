"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const conversationSchema = new mongoose_1.default.Schema({
    participants: {
        type: [mongoose_1.default.Schema.ObjectId],
        ref: "User",
    },
    isGroup: {
        type: Boolean,
        default: false,
    },
    groupName: {
        type: String,
        default: "",
    },
    isPublic: {
        type: Boolean,
        default: false,
    },
    groupImage: {
        type: String,
        default: "",
    },
    admin: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    }
}, {
    timestamps: true,
});
exports.ConversationModel = mongoose_1.default.model("Conversation", conversationSchema);
