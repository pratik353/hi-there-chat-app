import { Router } from "express";
import zod from "zod";
import { HTTPError } from "../helper/error";
import { UserModel } from "../models/user.schema";
import bcrypt from "bcrypt";
import { generateToken } from "../helper";
import { userMiddleware } from "../middlewares/userMiddleware";

const authRouter = Router();

const userLoginSchema = zod.object({
  email: zod.string(),
  password: zod.string(),
});

authRouter.post("/login", async (req, res) => {
  const payload = req.body;
  try {
    const response = userLoginSchema.safeParse(payload);
    if (!response.success) {
      throw new HTTPError("invalid inputs", 400);
    }

    const user = await UserModel.findOne({ email: payload.email });
    if (!user) {
      throw new HTTPError("User does not exist with this email", 401);
    }

    const validatePassword = await bcrypt.compare(
      payload.password,
      user.password!
    );

    if (!validatePassword) {
      throw new HTTPError("Invalid password", 401);
    }

    const token = generateToken({ id: user._id, email: user.email });

    const updatedUser = await UserModel.findByIdAndUpdate(user._id, {
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
  } catch (error: any) {
    console.log(error);
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
