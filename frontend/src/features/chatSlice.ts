import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { chatService } from "@/services/chatService";
import type { User } from "@/types";

export interface ChatMessage {
  _id: string;
  sender: Pick<User, "_id" | "name" | "email" | "role">;
  receiver: string;
  content: string;
  fileUrl?: string;
  fileType?: "image" | "file";
  fileName?: string;
  createdAt: string;
}

interface ChatUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface ChatState {
  users: ChatUser[];
  selectedUserId: string | null;
  messages: ChatMessage[];
  onlineUsers: { _id: string; name: string }[];
  typingUsers: { userId: string; name: string }[];
  loading: boolean;
}

const initialState: ChatState = {
  users: [],
  selectedUserId: null,
  messages: [],
  onlineUsers: [],
  typingUsers: [],
  loading: false,
};

export const fetchChatUsers = createAsyncThunk("chat/fetchUsers", async () => {
  const res = await chatService.getUsers();
  return res.data as ChatUser[];
});

export const fetchMessages = createAsyncThunk("chat/fetchMessages", async (userId: string) => {
  const res = await chatService.getMessages(userId);
  return res.data as ChatMessage[];
});

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    selectUser: (state, action: PayloadAction<string>) => {
      state.selectedUserId = action.payload;
      state.messages = [];
      state.typingUsers = [];
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const msg = action.payload;
      const senderId = String(msg.sender?._id || msg.sender);
      const receiverId = String(msg.receiver);
      const selected = state.selectedUserId;
      if (!selected) return;
      const isMyConvo = senderId === selected || receiverId === selected;
      if (isMyConvo && !state.messages.find((m) => m._id === String(msg._id))) {
        state.messages.push(msg);
      }
    },
    removeMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter((m) => m._id !== action.payload);
    },
    setOnlineUsers: (state, action: PayloadAction<{ _id: string; name: string }[]>) => {
      state.onlineUsers = action.payload;
    },
    addTypingUser: (state, action: PayloadAction<{ userId: string; name: string }>) => {
      if (!state.typingUsers.find((t) => t.userId === action.payload.userId)) {
        state.typingUsers.push(action.payload);
      }
    },
    removeTypingUser: (state, action: PayloadAction<{ userId: string }>) => {
      state.typingUsers = state.typingUsers.filter((t) => t.userId !== action.payload.userId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatUsers.fulfilled, (state, action) => { state.users = action.payload; })
      .addCase(fetchMessages.pending, (state) => { state.loading = true; })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
        state.loading = false;
      })
      .addCase(fetchMessages.rejected, (state) => { state.loading = false; });
  },
});

export const { selectUser, addMessage, removeMessage, setOnlineUsers, addTypingUser, removeTypingUser } = chatSlice.actions;
export default chatSlice.reducer;
