import { Router } from "express";
import { userMiddleware } from "../middlewares/userMiddleware";
import {
  createConversation,
  deleteConversation,
  getConversationDetails,
  getUserConversation,
  updateConversation,
} from "../controllers/conversationController";

export const conversationRouter = Router();

conversationRouter.get("/user/:userId", userMiddleware, getUserConversation);

conversationRouter.get("/:id", userMiddleware, getConversationDetails);

conversationRouter.post("/", userMiddleware, createConversation);

conversationRouter.put("/:id", userMiddleware, updateConversation);

conversationRouter.delete("/:id", userMiddleware, deleteConversation);
