import { Router } from "express";
import { userMiddleware } from "../middlewares/userMiddleware";
import { ConversationModel } from "../models/conversation.schema";
import z from "zod";
import { HTTPError } from "../helper/error";

const conversationSchema = z.object({
  participants: z.array(z.string()),
  groupName: z.string().optional(),
  isPrivate: z.boolean().optional(),
  groupImage: z.string().optional(),
});

export const conversationRouter = Router();

conversationRouter.get("/user/:userId", userMiddleware, async (req, res) => {
  const userId = req.params.userId;
  const type = req.query.type;

  try {
    const userConversations = await ConversationModel.find({
      $and: [
        { participants: { $in: [userId] } }, // Check if userId is in participants
        { isGroup: type == "groups" ? true : false }, // Check if conversation is active
      ],
    }).populate(
      "participants",
      "_id name email groupName groupImage admin profilePic"
    );

    let publicGroups: any[] = [];

    if (type == "groups") {
      publicGroups = await ConversationModel.find({
        $and: [
          { participants: { $nin: [userId] } }, // Check if userId is in participants
          { isGroup: true }, // Check if conversation is active
          { isPublic: true }, // Check if conversation is active
        ],
      }).populate(
        "participants",
        "_id name email groupName groupImage admin profilePic"
      );
    }

    res.json({ data: [...userConversations, ...publicGroups] });
  } catch (error) {
    console.log(error);
  }
});

conversationRouter.get("/:id", userMiddleware, async (req, res) => {
  const conversationId = req.params.id;

  try {
    const conversation = await ConversationModel.findById(conversationId)
      .select("-messages")
      .populate(
        "participants",
        "_id name email groupName groupImage admin profilePic"
      );

    res.json({ data: conversation });
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

conversationRouter.post("/", userMiddleware, async (req, res) => {
  const payload = req.body;
  const user = req.user;
  const type = req.query.type;

  try {
    const validationRes = conversationSchema.safeParse(payload);
    if (!validationRes.success) {
      res.status(400).json({ error: validationRes.error.issues });
      return;
    }
    const { participants, groupName, isPublic, groupImage } = payload;

    let inputData: any = {
      participants,
    };

    if (type == "group") {
      inputData = {
        ...inputData,
        isGroup: true,
        groupName: groupName,
        groupImage: groupImage,
        isPublic: isPublic,
        admin: user?._id,
      };
    }

    const conversation = await ConversationModel.create(inputData);

    conversation.save();

    res.status(201).json({
      message: "conversation created successfully",
      data: conversation,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
});

conversationRouter.put("/:id", userMiddleware, async (req, res) => {
  const conversationId = req.params.id;
  const payload = req.body;

  try {

    if (payload.joinId) {
      const conversation = await ConversationModel.findByIdAndUpdate(
        conversationId,
        { $push: { participants: Array.isArray(payload.joinId) ? payload.joinId : [payload.joinId] } },
      );

      res.json({ success: true });
      return ;
    }

    if (payload.leaveId) {
      const conversation = await ConversationModel.findByIdAndUpdate(
        conversationId,
        { $pull: { participants: payload.leaveId } }
      );

      res.json({ success: true });
      return ;
    }

    const conversation = await ConversationModel.findByIdAndUpdate(
      conversationId,
      {
        $set: payload,
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.log(error);
  }
});

conversationRouter.delete("/:id", userMiddleware, async (req, res) => {
  const conversationId = req.params.id;

  try {
    const conversation = await ConversationModel.findByIdAndDelete(
      conversationId
    );

    res.json({ success: true });
  } catch (error) {
    console.log(error);
  }
});
