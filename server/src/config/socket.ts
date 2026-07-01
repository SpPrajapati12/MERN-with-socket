import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyAccessToken } from "../utils/tokenService";
import User from "../models/User";
import Message from "../models/Message";

const onlineUsers = new Map<string, { socketId: string; name: string }>();

function getOnlineList() {
  return Array.from(onlineUsers.entries()).map(([id, { name }]) => ({ _id: id, name }));
}

export function initSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, { cors: { origin: "*" } });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select("name email role");
      if (!user) return next(new Error("User not found"));
      (socket as any).user = user;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user;
    const userId = user._id.toString();

    // Join personal room
    socket.join(userId);
    console.log(`[Socket] User connected: ${user.name} (${userId}), socketId: ${socket.id}`);
    onlineUsers.set(userId, { socketId: socket.id, name: user.name });
    io.emit("onlineUsers", getOnlineList());

    socket.on("sendMessage", async ({ receiverId, content, fileUrl, fileType, fileName }: {
      receiverId: string; content?: string; fileUrl?: string; fileType?: string; fileName?: string;
    }) => {
      if ((!content?.trim() && !fileUrl) || !receiverId) return;
      console.log(`[Socket] sendMessage from ${userId} to ${receiverId}`);
      const message = await Message.create({
        sender: user._id, receiver: receiverId,
        content: content?.trim() || "", fileUrl, fileType, fileName,
      });
      const populated = await message.populate("sender", "name email role");
      const msgObj = JSON.parse(JSON.stringify(populated));
      msgObj.receiver = receiverId;

      console.log(`[Socket] Emitting newMessage to rooms: ${userId}, ${receiverId}`);
      io.to(userId).to(receiverId).emit("newMessage", msgObj);
    });

    socket.on("deleteMessage", async ({ messageId }: { messageId: string }) => {
      const msg = await Message.findById(messageId);
      if (!msg || msg.sender.toString() !== userId) return;
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (msg.createdAt < dayAgo) return;
      await msg.deleteOne();
      const receiverId = msg.receiver.toString();
      io.to(userId).to(receiverId).emit("messageDeleted", { messageId });
    });

    socket.on("typing", ({ receiverId }: { receiverId: string }) => {
      io.to(receiverId).emit("userTyping", { userId, name: user.name });
    });

    socket.on("stopTyping", ({ receiverId }: { receiverId: string }) => {
      io.to(receiverId).emit("userStopTyping", { userId });
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("onlineUsers", getOnlineList());
    });
  });

  return io;
}
