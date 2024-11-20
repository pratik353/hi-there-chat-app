import mongoose, { Mongoose } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name required"],
    },
    email: {
      type: String,
      required: [true, "email required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "email required"],
    },
    token: {
      type: String,
    },
    profilePic: {
      type: String,
    },
    conversations:{
      type: [mongoose.Schema.Types.ObjectId],
      ref:'conversation'
    }
  },
  {
    timestamps: true,
  }
);


export const UserModel = mongoose.model('User', userSchema)