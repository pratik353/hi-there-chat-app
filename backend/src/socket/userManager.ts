import { WebSocket } from "ws";
import { RoomManager } from "./roomManager";
import { ConversationModel } from "../models/conversation.schema";
import mongoose from "mongoose";

export class User {
  public user: any;
  public conversationId?: string;
  private readonly ws: WebSocket;

  constructor(ws: any, user: any) {
    this.ws = ws;
    this.user = user;
    this.initHandlers();
  }

  initHandlers() {
    this.ws.on("message", async (data) => {
      const parsedData = JSON.parse(data.toString());
      
      console.log(parsedData, "--->");

      switch (parsedData.type) {
        case "join":
          if (!this.user) {
            this.ws.close();
            return;
          }

          this.conversationId = parsedData.payload.conversationId;

          
          const conversation = await ConversationModel.findOne({
            participants: this.user._id,
          });
          
          // TODO:- send error if conversation is not found
          if (!conversation) {
            this.ws.close();
            return;
          }

          this.conversationId = conversation.id;

          RoomManager.getInstance().addUser(conversation.id, this);
          break;

        default:
          console.error("Unknown message type");
      }
    });
  }

  destroy() {
    RoomManager.getInstance().broadCastMessage(
      {
        type: "user-left",
        payload: { userId: this.user._id },
      },
      this.conversationId,
      this
    );
    return;
  }

  send(payload: any) {
    this.ws.send(JSON.stringify(payload));
  }
}
