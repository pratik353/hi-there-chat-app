"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "name required"],
    },
    email: {
        type: String,
        required: [true, "email required"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "email required"],
    },
    token: {
        type: String,
    },
    profilePic: {
        type: String,
    },
}, {
    timestamps: true,
});
exports.UserModel = mongoose_1.default.model("User", userSchema);
