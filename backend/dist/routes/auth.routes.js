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
const express_1 = require("express");
const zod_1 = __importDefault(require("zod"));
const error_1 = require("../helper/error");
const user_schema_1 = require("../models/user.schema");
const bcrypt_1 = __importDefault(require("bcrypt"));
const helper_1 = require("../helper");
const userMiddleware_1 = require("../middlewares/userMiddleware");
const authRouter = (0, express_1.Router)();
const userLoginSchema = zod_1.default.object({
    email: zod_1.default.string(),
    password: zod_1.default.string(),
});
authRouter.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    try {
        const response = userLoginSchema.safeParse(payload);
        if (!response.success) {
            throw new error_1.HTTPError("invalid inputs", 400);
        }
        const user = yield user_schema_1.UserModel.findOne({ email: payload.email });
        if (!user) {
            throw new error_1.HTTPError("User does not exist with this email", 401);
        }
        const validatePassword = yield bcrypt_1.default.compare(payload.password, user.password);
        if (!validatePassword) {
            throw new error_1.HTTPError("Invalid password", 401);
        }
        const token = (0, helper_1.generateToken)({ id: user._id, email: user.email });
        const updatedUser = yield user_schema_1.UserModel.findByIdAndUpdate(user._id, {
            token: token,
        });
        res.json({
            message: "User logged in successfully",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
                success: true,
                token,
            },
        });
    }
    catch (error) {
        console.log(error);
        if (error instanceof error_1.HTTPError) {
            res.status(error.code).send({
                success: false,
                message: error.message,
            });
        }
        else {
            res.status(500).send({
                success: false,
                message: error.message,
            });
        }
    }
}));
authRouter.post("/logout", userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = req.user;
        const user = yield user_schema_1.UserModel.findByIdAndUpdate(payload === null || payload === void 0 ? void 0 : payload._id, {
            $set: {
                token: "",
            },
        });
        if (!user) {
            throw new error_1.HTTPError("User not found", 401);
        }
        res.json({
            message: "User logged-out successfully",
        });
    }
    catch (error) {
        if (error instanceof error_1.HTTPError) {
            res.status(error.code).send({
                success: false,
                message: error.message,
            });
        }
        else {
            res.status(500).send({
                success: false,
                message: error.message,
            });
        }
    }
}));
exports.default = authRouter;
