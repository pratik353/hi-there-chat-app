import { Router } from "express";
import zod from "zod";
import { UserModel } from "../models/user.schema";
import bcrypt from "bcrypt";
import { HTTPError } from "../helper/error";

const userRouter = Router();

// Object input validation
const userRegisterSchema = zod.object({
  email: zod.string(),
  password: zod.string(),
  name: zod.string(), //  = either IN or US
});

// type user = zod.infer<typeof userRegisterSchema>;

userRouter.get("/", async (req, res) => {
  const users = await UserModel.find().select("-password");
  res.json({ data: users });
});

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

    res.json({ message: "register user successfully", newUser });

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

export default userRouter;
