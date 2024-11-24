import { Router } from "express";
import { userMiddleware } from "../middlewares/userMiddleware";

import {
  getAllUSers,
  getUserDetails,
  registerUser,
  updateUserDetails,
} from "../controllers/userController";

const userRouter = Router();

userRouter.post("/register", registerUser);

userRouter.get("/:userId", userMiddleware, getUserDetails);

userRouter.get("/", userMiddleware, getAllUSers);

userRouter.put("/:userId", userMiddleware, updateUserDetails);

export default userRouter;
