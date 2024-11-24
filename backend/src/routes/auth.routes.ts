import { Router } from "express";
import { HTTPError } from "../helper/error";
import { UserModel } from "../models/user.schema";

import { userMiddleware } from "../middlewares/userMiddleware";
import { loginUser } from "../controllers/userController";

const authRouter = Router();

authRouter.post("/login", loginUser);

// NOT USING FOR NOW
authRouter.post("/logout", userMiddleware, async (req, res) => {
  try {
    const payload = req.user;

    const user = await UserModel.findByIdAndUpdate(payload?._id, {
      $set: {
        token: "",
      },
    });

    if (!user) {
      throw new HTTPError("User not found", 401);
    }

    res.json({
      message: "User logged-out successfully",
    });
  } catch (error: any) {
    if (error instanceof HTTPError) {
      res.status(error.code).send({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
});

export default authRouter;
