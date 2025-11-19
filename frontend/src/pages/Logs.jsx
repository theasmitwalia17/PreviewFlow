// frontend/src/pages/Logs.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

export default function Logs() {
  const { id } = useParams(); // preview id
  const [logs, setLogs] = useState("");
  const socketRef = useRef(null);
  const token = localStorage.getItem("token");

  // fetch existing saved logs first
  useEffect(() => {
    if (!token) return;
    axios.get(`http://localhost:4000/api/preview/${id}/logs`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setLogs(res.data.logs || "");
    }).catch(err => {
      console.error(err);
      setLogs((prev) => prev + "\n[error fetching saved logs]");
    });
  }, [id, token]);

  // set up socket connection
  useEffect(() => {
    if (!token) return;

    const socket = io("http://localhost:4000", {
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("socket connected", socket.id);
      // register for this preview with token
      socket.emit("register", { previewId: id, token });
    });

    socket.on("registered", (d) => {
      console.log("registered to preview room", d);
    });

    socket.on("log", ({ chunk }) => {
      setLogs(prev => prev + chunk);
      // keep scroll at bottom if using a container (optional)
    });

    socket.on("log-finish", ({ url }) => {
      setLogs(prev => prev + `\n\n=== BUILD FINISHED: ${url} ===\n`);
    });

    socket.on("log-error", ({ message }) => {
      setLogs(prev => prev + `\n\n=== BUILD ERROR: ${message} ===\n`);
    });

    socket.on("error", (msg) => {
      console.error("socket error", msg);
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [id, token]);

  return (
    <div className="p-6 font-mono whitespace-pre-wrap bg-black text-green-400 min-h-screen text-sm">
      <h1 className="text-2xl mb-4 text-white">Live Build Logs</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>{logs}</pre>
    </div>
  );
}
