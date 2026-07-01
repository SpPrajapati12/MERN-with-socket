import { useEffect, useRef, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import {
  fetchChatUsers, fetchMessages, selectUser,
  addMessage, removeMessage, setOnlineUsers, addTypingUser, removeTypingUser,
} from "@/features/chatSlice";
import { chatService } from "@/services/chatService";
import { useSocket } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, MessageCircle, Trash2, Paperclip, FileText, X } from "lucide-react";

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const { users, selectedUserId, messages, onlineUsers, typingUsers, loading } = useAppSelector((s) => s.chat);
  const { user: me } = useAppSelector((s) => s.auth);
  const socket = useSocket();
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { dispatch(fetchChatUsers()); }, [dispatch]);

  useEffect(() => {
    if (selectedUserId) dispatch(fetchMessages(selectedUserId));
  }, [selectedUserId, dispatch]);

  useEffect(() => {
    if (!socket) return;
    socket.on("newMessage", (msg) => dispatch(addMessage(msg)));
    socket.on("onlineUsers", (u) => dispatch(setOnlineUsers(u)));
    socket.on("userTyping", (data) => dispatch(addTypingUser(data)));
    socket.on("userStopTyping", (data) => dispatch(removeTypingUser(data)));
    socket.on("messageDeleted", ({ messageId }) => dispatch(removeMessage(messageId)));
    return () => {
      socket.off("newMessage"); socket.off("onlineUsers");
      socket.off("userTyping"); socket.off("userStopTyping"); socket.off("messageDeleted");
    };
  }, [socket, dispatch]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && !preview) || !socket || !selectedUserId) return;

    let fileData: { url: string; fileType: string; fileName: string } | undefined;
    if (preview) {
      setUploading(true);
      try {
        const res = await chatService.uploadFile(preview.file);
        fileData = { url: res.data.url, fileType: res.data.fileType, fileName: res.data.fileName };
      } catch {
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    socket.emit("sendMessage", {
      receiverId: selectedUserId,
      content: input.trim(),
      ...(fileData && { fileUrl: fileData.url, fileType: fileData.fileType, fileName: fileData.fileName }),
    });
    socket.emit("stopTyping", { receiverId: selectedUserId });
    setInput("");
    setPreview(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
    setPreview({ file, url });
    e.target.value = "";
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    if (selectedUserId) {
      socket?.emit("typing", { receiverId: selectedUserId });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => socket?.emit("stopTyping", { receiverId: selectedUserId }), 1000);
    }
  };

  const handleDelete = (messageId: string) => socket?.emit("deleteMessage", { messageId });
  const canDelete = (createdAt: string) => Date.now() - new Date(createdAt).getTime() < 86400000;
  const isOnline = (id: string) => onlineUsers.some((u) => u._id === id);
  const selectedUser = users.find((u) => u._id === selectedUserId);
  const otherTyping = typingUsers.filter((t) => t.userId === selectedUserId);

  const renderMessage = (msg: typeof messages[0]) => {
    const isMe = String(msg.sender._id || msg.sender) === me?._id;
    return (
      <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"} group`}>
        <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
          isMe ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : "bg-[hsl(var(--accent))]"
        }`}>
          {msg.fileUrl && msg.fileType === "image" && (
            <a href={msg.fileUrl} target="_blank" rel="noreferrer">
              <img src={msg.fileUrl} alt="" className="rounded max-h-48 mb-1" />
            </a>
          )}
          {msg.fileUrl && msg.fileType === "file" && (
            <a href={msg.fileUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 mb-1 underline opacity-80">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{msg.fileName || "File"}</span>
            </a>
          )}
          {msg.content && <p>{msg.content}</p>}
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] opacity-50">
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            {isMe && canDelete(msg.createdAt) && (
              <button onClick={() => handleDelete(msg._id)}
                className="opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-opacity">
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-0 h-[calc(100vh-10rem)] border rounded-lg overflow-hidden">
      {/* Users list */}
      <div className="w-64 border-r flex flex-col bg-[hsl(var(--card))]">
        <div className="p-3 border-b font-semibold text-sm">Contacts</div>
        <div className="flex-1 overflow-y-auto">
          {users.map((u) => (
            <button key={u._id} onClick={() => dispatch(selectUser(u._id))}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-[hsl(var(--accent))] ${
                selectedUserId === u._id ? "bg-[hsl(var(--accent))]" : ""
              }`}>
              <span className={`h-2 w-2 rounded-full shrink-0 ${isOnline(u._id) ? "bg-green-500" : "bg-gray-300"}`} />
              <div className="min-w-0">
                <p className="font-medium truncate">{u.name}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{u.email}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {!selectedUserId ? (
          <div className="flex-1 flex items-center justify-center text-[hsl(var(--muted-foreground))]">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Select a user to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-3 border-b flex items-center gap-2 bg-[hsl(var(--card))]">
              <span className={`h-2 w-2 rounded-full ${isOnline(selectedUserId) ? "bg-green-500" : "bg-gray-300"}`} />
              <span className="font-semibold text-sm">{selectedUser?.name}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                {isOnline(selectedUserId) ? "Online" : "Offline"}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading && <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">Loading...</p>}
              {!loading && messages.length === 0 && (
                <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">No messages yet. Say hi!</p>
              )}
              {messages.map(renderMessage)}
              <div ref={bottomRef} />
            </div>

            {otherTyping.length > 0 && (
              <div className="px-4 py-1 text-xs text-[hsl(var(--muted-foreground))]">
                {selectedUser?.name} is typing...
              </div>
            )}

            {/* File preview */}
            {preview && (
              <div className="px-3 pt-2 flex items-center gap-2">
                {preview.url ? (
                  <img src={preview.url} alt="" className="h-16 rounded" />
                ) : (
                  <div className="flex items-center gap-1 text-xs bg-[hsl(var(--accent))] px-2 py-1 rounded">
                    <FileText className="h-3 w-3" /> {preview.file.name}
                  </div>
                )}
                <button onClick={() => setPreview(null)}><X className="h-4 w-4 opacity-50" /></button>
              </div>
            )}

            <div className="p-3 border-t flex gap-2">
              <input ref={fileRef} type="file" className="hidden" onChange={handleFileSelect} />
              <Button variant="ghost" size="icon" onClick={() => fileRef.current?.click()} disabled={uploading}>
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon" disabled={(!input.trim() && !preview) || uploading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
