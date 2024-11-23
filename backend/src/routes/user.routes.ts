import { Router } from "express";
import zod from "zod";
import { UserModel } from "../models/user.schema";
import bcrypt from "bcrypt";
import { HTTPError } from "../helper/error";
import { userMiddleware } from "../middlewares/userMiddleware";

const userRouter = Router();

// Object input validation
const userRegisterSchema = zod.object({
  email: zod.string(),
  password: zod.string(),
  name: zod.string(), //  = either IN or US
});

// type user = zod.infer<typeof userRegisterSchema>;

userRouter.post("/register", async (req, res) => {
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

    res.json({ message: "register user successfully" });
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

userRouter.get("/:userId", userMiddleware, async (req, res) => {
  const userId = req.params.userId;
  const user = await UserModel.findById(userId).select("-password");
  res.json({ data: user });
});

userRouter.get("/", userMiddleware, async (req, res) => {
  const user = req.user;
  const users = await UserModel.find({ _id: { $ne: user?._id } }).select(
    "-password"
  );
  res.json({ data: users });
});

userRouter.put("/:userId", userMiddleware, async (req, res) => {
  const userId = req.params.userId;
  const payload = req.body;

  const user = await UserModel.findByIdAndUpdate(userId, {
    $set: payload,
  });
  res.json({ message: "User updated successfully", success: true });
});

export default userRouter;
