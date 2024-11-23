"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
class RoomManager {
    constructor() {
        this.rooms = new Map();
        this.rooms = new Map();
    }
    static getInstance() {
        return this.instance || (this.instance = new RoomManager());
    }
    removeUserFromRoom(conversationId, id) {
        if (!this.rooms.has(conversationId)) {
            return;
        }
        const users = this.rooms.get(conversationId);
        this.rooms.set(conversationId, (users === null || users === void 0 ? void 0 : users.filter((user) => user._id !== id)) || []);
    }
    addUser(conversationId, user) {
        var _a;
        if (!this.rooms.has(conversationId)) {
            this.rooms.set(conversationId, [user]);
            return;
        }
        this.rooms.set(conversationId, [...((_a = this.rooms.get(conversationId)) !== null && _a !== void 0 ? _a : []), user]);
    }
    broadCastMessage(message, conversationId = '', user) {
        // implement the logic to broadcast the message to all users in the room
        if (!this.rooms.has(conversationId)) {
            return;
        }
        const users = this.rooms.get(conversationId);
        users === null || users === void 0 ? void 0 : users.forEach((u) => {
            // implement the logic to send the message to the user
            if (u.id !== user._id) {
                u.send(message);
            }
        });
    }
}
exports.RoomManager = RoomManager;
