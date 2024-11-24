"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationRouter = void 0;
const express_1 = require("express");
const userMiddleware_1 = require("../middlewares/userMiddleware");
const conversationController_1 = require("../controllers/conversationController");
exports.conversationRouter = (0, express_1.Router)();
exports.conversationRouter.get("/user/:userId", userMiddleware_1.userMiddleware, conversationController_1.getUserConversation);
exports.conversationRouter.get("/:id", userMiddleware_1.userMiddleware, conversationController_1.getConversationDetails);
exports.conversationRouter.post("/", userMiddleware_1.userMiddleware, conversationController_1.createConversation);
exports.conversationRouter.put("/:id", userMiddleware_1.userMiddleware, conversationController_1.updateConversation);
exports.conversationRouter.delete("/:id", userMiddleware_1.userMiddleware, conversationController_1.deleteConversation);
