// frontend/src/pages/Logs.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

export default function Logs() {
  const { id } = useParams(); // preview id
  const [logs, setLogs] = useState("");
  const [status, setStatus] = useState("loading");
  const socketRef = useRef(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const logRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    // fetch saved logs first
    axios
      .get(`http://localhost:4000/api/preview/${id}/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setLogs(res.data.logs || "");
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Failed to fetch logs:", err);
        setLogs((prev) => prev + "\n[Error fetching saved logs]");
        setStatus("ready");
      });
  }, [id, token, navigate]);

  // Scroll to bottom on logs change
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (!token) return;

    const socket = io("http://localhost:4000", {
      transports: ["websocket"],
      withCredentials: true
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected", socket.id);
      // register to preview room (backend verifies JWT)
      socket.emit("register", { previewId: id, token });
    });

    socket.on("registered", () => {
      console.log("Registered to preview");
    });

    socket.on("log", ({ chunk }) => {
      setLogs((prev) => prev + chunk);
    });

    socket.on("log-finish", ({ url }) => {
      setLogs((prev) => prev + `\n\n=== BUILD FINISHED: ${url} ===\n`);
    });

    socket.on("log-error", ({ message }) => {
      setLogs((prev) => prev + `\n\n=== BUILD ERROR: ${message} ===\n`);
    });

    socket.on("error", (msg) => {
      console.error("Socket error:", msg);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [id, token]);

  return (
    <div className="p-6 min-h-screen bg-black text-green-400 font-mono text-sm">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl text-white">Live Build Logs</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate("/")} className="px-3 py-1 bg-gray-700 text-white rounded">Back</button>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); }} className="px-3 py-1 bg-blue-600 text-white rounded">Copy URL</button>
        </div>
      </div>

      <div
        ref={logRef}
        style={{ maxHeight: "75vh", overflow: "auto", whiteSpace: "pre-wrap" }}
        className="rounded p-4 bg-black border border-gray-800"
      >
        {logs || "Waiting for logs..."}
      </div>
    </div>
  );
}
