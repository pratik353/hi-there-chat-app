import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const dbURI = process.env.DATABASE_URL!;

export const connectDB = async() => {
  mongoose
    .connect(dbURI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("Connection error", error));
};
