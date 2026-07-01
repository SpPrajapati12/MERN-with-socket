import api from "./api";

export const chatService = {
  getUsers: () => api.get("/chat/users").then((r) => r.data),
  getMessages: (userId: string) => api.get(`/chat/messages/${userId}`).then((r) => r.data),
  uploadFile: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/chat/upload", fd).then((r) => r.data);
  },
};
