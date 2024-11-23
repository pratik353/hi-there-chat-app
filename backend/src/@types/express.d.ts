import { Schema } from 'mongoose';
import { Request } from 'express';
import { Mongoose } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: mongoose.Schema.ObjectId,
        email: string,
      }; // You can replace `any` with a specific type for the `user` object
    }
  }
}