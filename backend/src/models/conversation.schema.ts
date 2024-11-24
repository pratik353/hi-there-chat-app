import mongoose from "mongoose";


const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [mongoose.Schema.ObjectId],
      ref: "User",
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      default: "",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    groupImage: {
      type: String,
      default: "",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  },
  {
    timestamps: true,
  }
);

export const ConversationModel = mongoose.model(
  "Conversation",
  conversationSchema
);
