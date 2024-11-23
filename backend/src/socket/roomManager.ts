import { User } from "./userManager";

export class RoomManager {
  rooms: Map<string, any[]> = new Map();
  static instance: RoomManager;

  constructor() {
    this.rooms = new Map();
  }

  static getInstance() {
    return this.instance || (this.instance = new RoomManager());
  }

  public removeUserFromRoom(conversationId: string, id: string) {
    if (!this.rooms.has(conversationId)) {
      return;
    }

    const users = this.rooms.get(conversationId);
    this.rooms.set(
      conversationId,
      users?.filter((user) => user._id !== id) || []
    );
  }

  public addUser(conversationId: string, user: any) {
    if (!this.rooms.has(conversationId)) {
      this.rooms.set(conversationId, [user]);
      return
    }

    this.rooms.set(conversationId, [...(this.rooms.get(conversationId) ?? []), user]);
  }

  public broadCastMessage(message: any, conversationId: string ='', user:any){
    // implement the logic to broadcast the message to all users in the room
    if(! this.rooms.has(conversationId)){
        return;
    }
     const users = this.rooms.get(conversationId);
     users?.forEach((u) => {
        // implement the logic to send the message to the user
        if(u.id !== user._id){
            u.send(message);
        }
     })
  }
}
