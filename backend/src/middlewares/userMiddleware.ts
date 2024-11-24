import { NextFunction, Request, Response } from "express";
import { decodeToken } from "../helper";
import { JwtPayload } from "jsonwebtoken";

export async function userMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = decodeToken(token) as JwtPayload;
    const user = {
      _id: decoded.id,
      email: decoded.email,
    }
    req.user = user;
    next();
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
}
