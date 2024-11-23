"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const roomManager_1 = require("./roomManager");
const conversation_schema_1 = require("../models/conversation.schema");
class User {
    constructor(ws, user) {
        this.ws = ws;
        this.user = user;
        this.initHandlers();
    }
    initHandlers() {
        this.ws.on("message", (data) => __awaiter(this, void 0, void 0, function* () {
            const parsedData = JSON.parse(data.toString());
            console.log(parsedData, "--->");
            switch (parsedData.type) {
                case "join":
                    if (!this.user) {
                        this.ws.close();
                        return;
                    }
                    this.conversationId = parsedData.payload.conversationId;
                    const conversation = yield conversation_schema_1.ConversationModel.findOne({
                        participants: this.user._id,
                    });
                    // TODO:- send error if conversation is not found
                    if (!conversation) {
                        this.ws.close();
                        return;
                    }
                    this.conversationId = conversation.id;
                    roomManager_1.RoomManager.getInstance().addUser(conversation.id, this);
                    break;
                default:
                    console.error("Unknown message type");
            }
        }));
    }
    destroy() {
        roomManager_1.RoomManager.getInstance().broadCastMessage({
            type: "user-left",
            payload: { userId: this.user._id },
        }, this.conversationId, this);
        return;
    }
    send(payload) {
        this.ws.send(JSON.stringify(payload));
    }
}
exports.User = User;
