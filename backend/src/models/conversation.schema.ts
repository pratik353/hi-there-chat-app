import mongoose  from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [mongoose.Schema.ObjectId],
      ref:"User"
    },
    isGroup: {
      type: Boolean,
    },
    groupName: {
      type: String,
    },
    isPublic: {
      type: Boolean,
    },
    groupImage: {
      type: String,
    },
    admin:{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }
  },
  {
    timestamps: true,
  }
);


export const ConversationModel = mongoose.model('Conversation', conversationSchema)