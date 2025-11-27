import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { X, Copy, Loader2, ArrowDownCircle } from "lucide-react";

/**
 * Visual Highlighting Logic
 */
const highlightKeywords = (text) => {
  if(!text) return "";
  const parts = text.split(/(\s+)/); 
  return parts.map((part, i) => {
    if (part.match(/^[0-9.]+s$/)) return <span key={i} className="text-yellow-400 font-bold">{part}</span>;
    if (part.includes("http")) return <a key={i} href={part} target="_blank" rel="noreferrer" className="text-blue-400 underline decoration-blue-400/30 hover:text-blue-300">{part}</a>;
    if (part === "npm") return <span key={i} className="text-red-400 font-semibold">{part}</span>;
    if (["install", "run", "build", "dev"].includes(part)) return <span key={i} className="text-cyan-400">{part}</span>;
    if (part.startsWith("sha256:")) return <span key={i} className="text-purple-400">{part.substring(0, 12)}...</span>;
    return part;
  });
};

/**
 * Visual Line Parsing
 */
const parseLogLine = (line, index) => {
  const cleanLine = line ? line.replace(/\r/g, "").trimEnd() : "";
  if (!cleanLine) return null;

  // Headers
  if (cleanLine.startsWith("===") || cleanLine.includes("BUILD FINISHED")) {
    return <div key={index} className="py-4 mt-2 font-bold text-emerald-400 border-t border-white/10 tracking-wider">{cleanLine}</div>;
  }

  // Docker Steps
  if (cleanLine.trim().startsWith("#")) {
    const stepMatch = cleanLine.match(/^(#\d+)\s+(.*)/);
    if (stepMatch) {
      return (
        <div key={index} className="flex gap-3 py-0.5 group hover:bg-white/5 -mx-2 px-2 rounded transition-colors">
          <span className="text-blue-500 font-bold min-w-[35px] shrink-0 select-none opacity-80 group-hover:opacity-100">{stepMatch[1]}</span>
          <span className="text-gray-300 break-all whitespace-pre-wrap">{highlightKeywords(stepMatch[2])}</span>
        </div>
      );
    }
  }

  // Errors
  if (cleanLine.toLowerCase().includes("error") || cleanLine.toLowerCase().includes("failed")) {
    return (
      <div key={index} className="flex border-l-[3px] border-red-500 bg-red-500/5 pl-4 py-1">
        <span className="text-red-400 break-all whitespace-pre-wrap leading-relaxed">{cleanLine}</span>
      </div>
    );
  }

  // Success
  if (cleanLine.includes("DONE") || cleanLine.includes("success")) {
    return (
        <div key={index} className="flex gap-3 text-emerald-400 font-medium py-1">
             <span className="text-blue-500 font-bold min-w-[35px] shrink-0 opacity-50">✓</span>
             <span className="break-all whitespace-pre-wrap">{cleanLine}</span>
        </div>
    )
  }

  // Default Line
  return <div key={index} className="text-gray-400 break-all whitespace-pre-wrap py-[1px] pl-[47px] hover:text-gray-200 transition-colors">{highlightKeywords(cleanLine)}</div>;
};

export default function Logs({ previewId, onClose }) {
  const params = useParams();
  const id = previewId || params.id;
  const isEmbedded = !!previewId;

  const [logs, setLogs] = useState("");
  const [status, setStatus] = useState("loading");
  const [autoScroll, setAutoScroll] = useState(true);
  
  const socketRef = useRef(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (!token) { if (!isEmbedded) navigate("/"); return; }
    setLogs(""); 
    setStatus("loading");
    axios.get(`http://localhost:4000/api/preview/${id}/logs`, { headers: { Authorization: `Bearer ${token}` }})
      .then((res) => { 
        setLogs((res.data.logs || "").replace(/\r/g, "")); 
        setStatus("ready"); 
      })
      .catch((err) => { console.error(err); setLogs((prev) => prev + "\n[Error fetching saved logs]"); setStatus("ready"); });
  }, [id, token, navigate, isEmbedded]);

  useEffect(() => {
    if (!token) return;
    const socket = io("http://localhost:4000", { transports: ["websocket"], withCredentials: true });
    socketRef.current = socket;
    socket.on("connect", () => socket.emit("register", { previewId: id, token }));
    socket.on("log", ({ chunk }) => { 
        setLogs((prev) => prev + chunk.replace(/\r/g, "")); 
        if(autoScroll) scrollToBottom(); 
    });
    socket.on("log-finish", ({ url }) => setLogs((prev) => prev + `\n\n=== BUILD FINISHED: ${url} ===\n`));
    socket.on("log-error", ({ message }) => setLogs((prev) => prev + `\n\n=== BUILD ERROR: ${message} ===\n`));
    return () => socket.disconnect();
  }, [id, token, autoScroll]);

  const scrollToBottom = () => { if (logContainerRef.current) logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight; };
  useEffect(() => { scrollToBottom(); }, [logs]);

  const handleScroll = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;
      setAutoScroll(isAtBottom);
  }

  const logLines = useMemo(() => logs.split("\n").map((line, index) => parseLogLine(line, index)), [logs]);
  const copyLogs = () => navigator.clipboard.writeText(logs);

  return (
    <div className={`flex flex-col h-full bg-[#09090b] text-gray-300 font-mono text-[13px] ${isEmbedded ? '' : 'min-h-screen'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-20 transition-all">
        <div className="flex items-center gap-4">
            <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.4)] ${status === 'loading' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]'}`} />
            <div>
                <h2 className="text-white font-semibold tracking-tight text-sm">Build Logs</h2>
                <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono mt-0.5">
                   <span>ID:</span><span className="bg-white/10 px-1.5 py-0.5 rounded text-gray-300">{id?.slice(0, 8)}</span>
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            {!autoScroll && (
                <button onClick={() => { setAutoScroll(true); scrollToBottom(); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full hover:bg-blue-500/20 transition-all mr-2">
                    <ArrowDownCircle size={14} /><span>Resume</span>
                </button>
            )}
            <button onClick={copyLogs} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-white" title="Copy"><Copy size={16} /></button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-white" title="Close"><X size={18} /></button>
        </div>
      </div>

      {/* Log Body */}
      <div ref={logContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto overflow-x-hidden p-6 custom-scrollbar scroll-smooth">
        {status === "loading" && !logs ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
            <span className="text-xs uppercase tracking-widest font-semibold">Initializing Environment...</span>
          </div>
        ) : (
          <div className="font-mono leading-relaxed tracking-wide text-[12px] md:text-[13px]">
            {logLines}
            <div className="mt-2 ml-[47px] animate-pulse w-2 h-4 bg-gray-500 inline-block align-middle" />
          </div>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #333; border-radius: 20px; border: 1px solid #09090b; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #555; }
      `}</style>
    </div>
  );
}