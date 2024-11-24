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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const error_1 = require("../helper/error");
const user_schema_1 = require("../models/user.schema");
const userMiddleware_1 = require("../middlewares/userMiddleware");
const userController_1 = require("../controllers/userController");
const authRouter = (0, express_1.Router)();
authRouter.post("/login", userController_1.loginUser);
// NOT USING FOR NOW
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
