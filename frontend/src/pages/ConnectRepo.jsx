import { useEffect, useState } from "react";
import axios from "axios";

export default function ConnectRepo() {
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:4000/api/repos", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setRepos(res.data));
  }, []);

  return (
    <div>
      <h1>Select a Repository</h1>
      {repos.map(r => (
        <div key={r.fullName} className="border p-2 flex justify-between">
          <span>{r.fullName}</span>
          <button
            onClick={() => {
              const token = localStorage.getItem("token");

              axios.post("http://localhost:4000/api/connect-repo", {
                repoOwner: r.owner,
                repoName: r.name
              }, {
                headers: { Authorization: `Bearer ${token}` }
              }).then(res => {

                const projectId = res.data.project.id;

                // 🔥 Automatically create webhook now
                return axios.post("http://localhost:4000/api/create-webhook", {
                  projectId
                }, {
                  headers: { Authorization: `Bearer ${token}` }
                });

              }).then(() => {
                alert("✅ Repo connected and webhook created!");
              }).catch(err => {
                console.log(err);
                alert("Failed. Check console.");
              });
            }}
            className="bg-blue-600 text-white px-2 py-1 rounded"
          >
            Connect
          </button>


        </div>
      ))}
    </div>
  );
}
