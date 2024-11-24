import { HTTPError } from "../helper/error";
import { UserModel } from "../models/user.schema";
import zod from "zod";
import bcrypt from "bcrypt";
import { generateToken } from "../helper";
import { Request, Response } from "express";

const userLoginSchema = zod.object({
  email: zod.string(),
  password: zod.string(),
});

// Object input validation
const userRegisterSchema = zod.object({
  email: zod.string(),
  password: zod.string(),
  name: zod.string(), //  = either IN or US
});

export const loginUser = async (req: Request, res: Response) => {
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
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
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
};

export const registerUser = async (req: Request, res: Response) => {
  const payload = req.body;

  const zodRes = userRegisterSchema.safeParse(payload);

  try {
    if (!zodRes.success) {
      throw new HTTPError("invalid inputs", 400);
    }

    const existingUser = await UserModel.findOne({ email: payload.email });
    if (existingUser) {
      throw new HTTPError("User already exists", 400);
    }

    const salt = await bcrypt.genSalt(10); // 10 means length of 10 chars
    const hashedPassword = await bcrypt.hash(payload.password, salt);

    const newUser = new UserModel({
      email: payload.email,
      password: hashedPassword,
      name: payload.name,
    });

    await newUser.save();

    res.json({ message: "register user successfully", success: true });
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
};

export const getUserDetails = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const user = await UserModel.findById(userId).select("-password");
  res.json({ data: user });
};

export const getAllUSers = async (req: Request, res: Response) => {
  const user = req.user;
  const users = await UserModel.find({ _id: { $ne: user?._id } }).select(
    "-password"
  );
  res.json({ data: users });
};

export const updateUserDetails = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const payload = req.body;

  const user = await UserModel.findByIdAndUpdate(userId, {
    $set: payload,
  });
  res.json({ message: "User updated successfully", success: true });
};
