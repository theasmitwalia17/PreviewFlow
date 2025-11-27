import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import Logs from "./Logs"; 

import {
  GitPullRequest,
  RefreshCw,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Loader2,
  AlertCircle,
  ArrowRight,
  Globe,
  Ban
} from "lucide-react";

// Socket connection
const socket = io("http://localhost:4000", { transports: ["websocket"] });

/**
 * Utility: Standard time formatter
 */
function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "";
  const numSeconds = parseFloat(seconds);
  if (numSeconds < 60) return `${numSeconds.toFixed(1)}s`;
  const m = Math.floor(numSeconds / 60);
  const s = Math.floor(numSeconds % 60);
  return `${m}m ${s}s`;
}

function getBuildTime(pre) {
  if (!pre.buildStartedAt) return null;
  // Logic: Only show time if we have a start time
  if (pre.status === 'building') return "Calculating...";
  if (!pre.buildCompletedAt) return null;

  const s = new Date(pre.buildStartedAt);
  const e = new Date(pre.buildCompletedAt);
  const diff = (e - s) / 1000;
  return formatDuration(diff);
}

/**
 * Visual Styles Helper
 */
function getStatusVisuals(status) {
  switch (status) {
    case "live":
      return { 
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        label: "Ready",
        border: "group-hover:border-emerald-500/50 bg-white",
        ring: ""
      };
    case "building":
      return { 
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />,
        label: "Building",
        border: "border-amber-400 bg-white", 
        ring: "ring-4 ring-amber-500/10"
      };
    case "error":
      return { 
        badge: "bg-red-50 text-red-700 border-red-200",
        icon: <XCircle className="w-3.5 h-3.5" />,
        label: "Error",
        border: "group-hover:border-red-500/50 bg-white",
        ring: ""
      };
    case "deleted":
      return { 
        badge: "bg-gray-100 text-gray-500 border-gray-200",
        icon: <Ban className="w-3.5 h-3.5" />,
        label: "Deleted",
        border: "border-gray-100 bg-gray-50/50 opacity-75 grayscale", // Faded look
        ring: ""
      };
    default:
      return { 
        badge: "bg-gray-100 text-gray-600 border-gray-200",
        icon: <Clock className="w-3.5 h-3.5" />,
        label: "Queued",
        border: "group-hover:border-gray-400/50 bg-white",
        ring: ""
      };
  }
}

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [processingPreview, setProcessingPreview] = useState(null);
  const [activeLogId, setActiveLogId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    axios.get("http://localhost:4000/api/projects", { headers: { Authorization: `Bearer ${token}` }})
      .then((res) => setProjects(res.data))
      .catch((err) => console.error(err));

    socket.on("preview-status-update", (update) => {
      setProjects((old) =>
        old.map((project) => {
          if (project.id !== update.projectId) return project;
          return {
            ...project,
            previews: project.previews.map((pre) =>
              pre.prNumber === update.prNumber
                ? { ...pre, ...update }
                : pre
            )
          };
        })
      );
    });

    return () => socket.off("preview-status-update");
  }, [token]);

  const rebuild = async (pre) => {
    setProcessingPreview(pre.id);
    try {
      await axios.post(`http://localhost:4000/api/preview/${pre.id}/rebuild`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch(e) { console.error(e); }
    setProcessingPreview(null);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const pre = deleteConfirm;
    setProcessingPreview(pre.id);
    setDeleteConfirm(null);

    try {
      await axios.post(`http://localhost:4000/api/preview/${pre.id}/delete`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch(e) { console.error(e); }
    setProcessingPreview(null);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans p-8 md:p-12 relative overflow-x-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {projects.map((project) => (
          <div key={project.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Repo Header */}
            <div className="flex items-center gap-4 mb-8 ml-1">
              <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                <GitPullRequest className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">{project.repoName}</h2>
                <p className="text-gray-500 text-sm">github.com/{project.repoOwner}</p>
              </div>
            </div>

            {project.previews.length === 0 ? (
               <div className="p-16 border border-dashed border-gray-300 rounded-2xl bg-white/60 backdrop-blur-sm text-center">
                <p className="text-gray-500">No active deployments found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.previews.map((pre) => {
                  const statusStyle = getStatusVisuals(pre.status);
                  const isProcessing = processingPreview === pre.id;
                  const buildDuration = getBuildTime(pre);
                  const isDeleted = pre.status === "deleted";

                  return (
                    <div
                      key={pre.id}
                      className={`group relative border rounded-2xl shadow-sm transition-all duration-300 ease-out flex flex-col overflow-hidden ${statusStyle.border} ${statusStyle.ring} ${!isDeleted && pre.status !== 'building' ? 'hover:shadow-xl hover:-translate-y-1' : ''}`}
                    >
                      <div className="p-6 flex-1">
                        
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                              <GitPullRequest size={10} />
                              Pull Request
                            </span>
                            <span className={`text-3xl font-mono font-bold tracking-tighter ${isDeleted ? 'text-gray-400' : 'text-gray-900'}`}>
                              #{pre.prNumber}
                            </span>
                          </div>
                          
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wide transition-all ${statusStyle.badge}`}>
                            {statusStyle.icon}
                            <span>{statusStyle.label}</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                           
                           {/* 1. LOGIC IMPROVEMENT: Only show time for Active/Error/Building states */}
                           {!isDeleted && pre.status !== 'queued' && (
                             <div className="flex items-center gap-2 text-xs text-gray-500 font-medium bg-gray-50 w-fit px-2 py-1 rounded-md border border-gray-100">
                                <Clock size={12} />
                                <span>{buildDuration ? buildDuration : 'Pending...'}</span>
                             </div>
                           )}

                           {/* URL Chip */}
                           <div className="mt-2">
                            {pre.status === "live" && pre.url ? (
                              <a 
                                href={pre.url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="group/link flex items-center justify-between w-full bg-gray-50 hover:bg-white border border-gray-200 hover:border-blue-300 p-2 rounded-lg transition-all duration-200"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="bg-white p-1 rounded-md border border-gray-200 text-gray-500">
                                     <Globe size={12} />
                                  </div>
                                  <span className="text-xs font-mono text-gray-600 group-hover/link:text-blue-600 truncate max-w-[150px]">
                                    {pre.url.replace(/^https?:\/\//, '')}
                                  </span>
                                </div>
                                <ArrowRight size={12} className="text-gray-300 group-hover/link:text-blue-500 -translate-x-2 opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                              </a>
                            ) : (
                               // Placeholder State logic
                               <div className="h-9 flex items-center px-1 text-xs text-gray-400 font-mono">
                                  {pre.status === 'building' ? (
                                    <span className="flex items-center gap-2 animate-pulse">Initializing...</span>
                                  ) : isDeleted ? (
                                    <span className="text-gray-300 italic">Preview removed</span>
                                  ) : (
                                    'Waiting for deployment...'
                                  )}
                               </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="px-6 py-4 border-t border-gray-100/50 bg-gray-50/50 flex items-center justify-between backdrop-blur-[2px]">
                         <button
                            onClick={() => setActiveLogId(pre.id)}
                            className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm px-4 py-2 rounded-full flex items-center gap-2 transition-all active:scale-95 group/btn"
                          >
                            <Terminal size={13} className="text-gray-400 group-hover/btn:text-black transition-colors" />
                            View Logs
                          </button>

                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => rebuild(pre)} 
                              disabled={isProcessing} 
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all active:scale-90" 
                              title="Rebuild"
                            >
                              <RefreshCw size={16} className={isProcessing ? "animate-spin" : ""} />
                            </button>
                            
                            {/* 2. LOGIC IMPROVEMENT: Disable Delete button if already deleted */}
                            <button 
                              onClick={() => setDeleteConfirm(pre)} 
                              disabled={isProcessing || isDeleted} 
                              className={`p-2 rounded-full transition-all active:scale-90 ${isDeleted ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`} 
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Slide-Over Logs Panel */}
      <div className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${activeLogId ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} onClick={() => setActiveLogId(null)} />
      <div className={`fixed top-0 right-0 h-full w-full md:w-[650px] lg:w-[900px] bg-[#09090b] shadow-2xl z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${activeLogId ? "translate-x-0" : "translate-x-full"}`}>
        {activeLogId && <Logs previewId={activeLogId} onClose={() => setActiveLogId(null)} />}
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white border border-gray-100 rounded-2xl shadow-2xl ring-1 ring-black/5 max-w-sm w-full p-6 zoom-in-95">
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mb-4">
               <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Deployment?</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              This will permanently remove <span className="font-mono font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">PR-{deleteConfirm.prNumber}</span>. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-all active:scale-95">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}