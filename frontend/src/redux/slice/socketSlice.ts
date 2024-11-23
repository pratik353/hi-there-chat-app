import { createSlice } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";

interface ISocketStates {
  socketInstance: Socket | null;
  onlineUsers: string[];
}

const initialState: ISocketStates = {
  socketInstance: null,
  onlineUsers: [],
};

const socketSlice = createSlice({
  name: "supportSkills",
  initialState,
  reducers: {
    setSocketInstance(state, action) {
      state.socketInstance = action.payload;
    },
    setOnlineUsers(state, action) {
      state.onlineUsers = action.payload;
    },
  },
});

export const { setOnlineUsers, setSocketInstance } = socketSlice.actions;

export const socketReducer = socketSlice.reducer;
