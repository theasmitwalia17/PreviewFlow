// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  RefreshCw,
  Trash,
  GitPullRequest,
  Loader2,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";

// CONNECT SOCKET
const socket = io("http://localhost:4000", {
  transports: ["websocket"]
});

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [processingPreview, setProcessingPreview] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // -------------------------------------
  // Load projects once (NO POLLING)
  // -------------------------------------
  const loadProjects = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/projects", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  // -------------------------------------
  // Setup real-time dashboard updates
  // -------------------------------------
  useEffect(() => {
    if (!token) return navigate("/");

    loadProjects();

    socket.on("preview-status-update", (update) => {
      console.log("Live update:", update);

      setProjects((prev) =>
        prev.map((project) => {
          if (project.id !== update.projectId) return project;

          // update preview inside project
          const previews = project.previews.map((p) =>
            p.prNumber === update.prNumber ? { ...p, ...update } : p
          );

          return { ...project, previews };
        })
      );
    });

    return () => {
      socket.off("preview-status-update");
    };
  }, []);

  // -------------------------------------
  // Helpers
  // -------------------------------------
  const badgeColor = (status) => {
    switch (status) {
      case "live":
        return "bg-green-500";
      case "building":
        return "bg-yellow-500 text-black";
      case "error":
        return "bg-red-500";
      case "deleted":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  const openPreview = (pre) => {
    if (pre.url) window.open(pre.url, "_blank");
  };

  const viewLogs = (pre) => {
    navigate(`/logs/${pre.id}`);
  };

  const rebuildPreview = async (pre) => {
    setProcessingPreview(pre.id);
    try {
      await axios.post(
        `http://localhost:4000/api/preview/${pre.id}/rebuild`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (e) {
      alert("Failed to rebuild");
    }
    setProcessingPreview(null);
  };

  const deletePreview = async (pre) => {
    if (!confirm("Delete this preview?")) return;
    setProcessingPreview(pre.id);

    try {
      await axios.post(
        `http://localhost:4000/api/preview/${pre.id}/delete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (e) {
      alert("Failed to delete");
    }
    setProcessingPreview(null);
  };

  // -------------------------------------
  // UI
  // -------------------------------------
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/connect")}>
            + Connect Repo
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
          >
            Logout
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-blue-600" />
                {project.repoOwner}/{project.repoName}
              </CardTitle>
              <CardDescription>
                Connected repo previews
              </CardDescription>
            </CardHeader>

            <CardContent>
              {project.previews.length === 0 ? (
                <p className="text-gray-500">No previews yet.</p>
              ) : (
                project.previews.map((pre) => (
                  <div
                    key={pre.id}
                    className="flex justify-between border p-4 mb-3 rounded-lg items-center"
                  >
                    <div>
                      <p className="font-medium">PR #{pre.prNumber}</p>

                      <Badge className={badgeColor(pre.status)} variant="outline">
                        {pre.status}
                      </Badge>

                      {pre.url && (
                        <p
                          className="text-blue-600 underline mt-1 cursor-pointer"
                          onClick={() => openPreview(pre)}
                        >
                          {pre.url}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => viewLogs(pre)}>
                        <ExternalLink className="w-4 h-4 mr-1" /> Logs
                      </Button>

                      <Button
                        size="sm"
                        className="bg-yellow-500"
                        onClick={() => rebuildPreview(pre)}
                        disabled={processingPreview === pre.id}
                      >
                        {processingPreview === pre.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        Rebuild
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deletePreview(pre)}
                        disabled={processingPreview === pre.id}
                      >
                        <Trash className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
