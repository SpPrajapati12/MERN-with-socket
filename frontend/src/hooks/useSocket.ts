import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAppSelector } from "@/app/hooks";

const SOCKET_URL = import.meta.env.VITE_API_URL.replace("/api", "");

export function useSocket() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const s = io(SOCKET_URL, { auth: { token } });

    s.on("connect", () => console.log("[Socket] Connected:", s.id));
    s.on("connect_error", (err) => console.error("[Socket] Connection error:", err.message));

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [token]);

  return socket;
}
