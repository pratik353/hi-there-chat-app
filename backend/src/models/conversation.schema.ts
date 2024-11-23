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
    //TODO
    isPrivate: {
      type: Boolean,
      default: true,
    },
    groupImage: {
      type: String,
      default: "",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    messages:{
      type:[mongoose.Schema.Types.ObjectId],
      ref:'Message'
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
