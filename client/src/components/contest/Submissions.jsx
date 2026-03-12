import React, { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE_URL}/api/v1/submissions`, {
          method: "GET",
          credentials: "include", // needed because backend auth uses cookies
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed with status ${res.status}`);
        }

        const data = await res.json();
        setSubmissions(data.submissions || []);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setError("Failed to load submissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Recent Submissions</h2>

      {error && (
        <div className="text-red-400 bg-red-400/10 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-card-dark border border-white/5 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-slate-400 font-medium text-sm px-8 py-3">Status</th>
              <th className="text-slate-400 font-medium text-sm px-8 py-3">Problem</th>
              <th className="text-slate-400 font-medium text-sm px-8 py-3">Language</th>
              <th className="text-slate-400 font-medium text-sm text-center px-8 py-3">Time</th>
              <th className="text-slate-400 font-medium text-sm text-center px-8 py-3">Memory</th>
              <th className="text-slate-400 font-medium text-sm px-8 py-3">Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-slate-500 text-center p-4">
                  Loading submissions...
                </td>
              </tr>
            ) : submissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-slate-500 text-center p-4">
                  No submissions found.
                </td>
              </tr>
            ) : (
              submissions.map((s, index) => (
                <tr key={s._id || index} className="group hover:bg-white/[0.02] transition-colors border-b border-white/10">
                  <td className="px-8 py-3">
                    <span className={`font-bold ${
                      s.status === "Accepted" ? "text-green-400" :
                      s.status === "Wrong Answer" ? "text-red-400" :
                      s.status === "Time Limit Exceeded" ? "text-yellow-400" :
                      s.status === "Compilation Error" ? "text-orange-400" :
                      "text-white"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="text-white font-bold px-8 py-3">{s.problem_id?.title || "Problem"}</td>
                  <td className="text-slate-300 text-sm px-8 py-3">{s.language || ""}</td>
                  <td className="text-slate-400 text-center px-8 py-3">{s.execution_time ? `${s.execution_time}s` : "N/A"}</td>
                  <td className="text-slate-400 text-center px-8 py-3">{s.memory ? `${s.memory} KB` : "N/A"}</td>
                  <td className="text-slate-400 px-8 py-3">
                    {s.submitted_at
                      ? new Date(s.submitted_at).toLocaleString()
                      : "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}