import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      default: "",
    },
    seen: {
      type: Boolean,
      default: false,
    },
    msgByUserId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "User",
    },
    conversation: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "Conversation",
    },
  },
  {
    timestamps: true,
  }
);

const MessageModel = mongoose.model("Message", messageSchema);
