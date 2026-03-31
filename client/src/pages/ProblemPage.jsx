import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import api from "../api/client";
import Navbar from "../layout/Navbar";
import CodeEditor, { LANGUAGE_IDS } from "../components/editor/CodeEditor";
import TestCasesConsole from "../components/editor/TestCasesConsole";

const DEFAULT_CODE = {
  71: `# Write your solution here`,
  63: `// Write your solution here`,
  50: `#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}`,
  62: `import java.util.*;\nimport java.lang.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws java.lang.Exception {\n        // Write your solution here\n    }\n}`,
};

const AUTOSAVE_DELAY = 1000;

function getSavedCode(problemId, languageId) {
  try { return localStorage.getItem(`code_${problemId}_${languageId}`) || null; } catch { return null; }
}
function saveCode(problemId, languageId, code) {
  try { localStorage.setItem(`code_${problemId}_${languageId}`, code); } catch {}
}

const DIFF_COLOR = {
  easy:   { bg: "rgba(52,211,153,0.15)", color: "#34d399" },
  medium: { bg: "rgba(251,191,36,0.15)", color: "#fbbf24" },
  hard:   { bg: "rgba(248,113,113,0.15)", color: "#f87171" },
};

export default function ChallengePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get("contest");
  const { isAuthenticated } = useContext(Context);

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState(DEFAULT_CODE[71]);
  const [languageId, setLanguageId] = useState(71);
  const [loading, setLoading] = useState(true);
  const [testCasesResult, setTestCasesResult] = useState(null);
  const [customRunResult, setCustomRunResult] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [personalNotes, setPersonalNotes] = useState("");
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");
  const autosaveTimer = useRef(null);

  useEffect(() => {
    if (!id) return;
    const saved = getSavedCode(id, languageId);
    setCode(saved || DEFAULT_CODE[languageId] || "");
    setAutoSaveStatus("saved");
  }, [id, languageId]);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const { data } = await api.get(`/problems/${id}`);
        setProblem(data.problem);
      } catch { setProblem(null); }
      finally { setLoading(false); }
    };
    if (id) fetchProblem();
  }, [id]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    setAutoSaveStatus("saving");
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      saveCode(id, languageId, newCode);
      setAutoSaveStatus("saved");
    }, AUTOSAVE_DELAY);
  };

  const handleLanguageChange = (e) => {
    const newId = Number(e.target.value);
    setLanguageId(newId);
    setRunResult(null);
    setSubmissionResult(null);
  };

  const [customInput, setCustomInput] = useState("");
  const [customExpected, setCustomExpected] = useState("");
  const [activeTab, setActiveTab] = useState("TEST CASES");

  const handleRun = async () => {
    setRunning(true);
    if (activeTab === "CUSTOM TEST CASE") {
      setCustomRunResult(null);
    } else {
      setTestCasesResult(null);
    }
    try {
      const payload = { source_code: code, language_id: languageId, problem_id: id };
      if (activeTab === "CUSTOM TEST CASE" && customInput.trim()) payload.custom_input = customInput;
      const { data } = await api.post("/submissions/run", payload);
      if (activeTab === "CUSTOM TEST CASE") {
        setCustomRunResult(data.run_result || null);
      } else {
        setTestCasesResult(data.run_result || null);
      }
    } catch (err) {
      const res = err.response?.data;
      setRunResult(res?.run_result || { status: "Error", stdout: "", stderr: res?.message || err.message });
    } finally { setRunning(false); }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmissionResult(null);
    try {
      const { data } = await api.post("/submissions/submit", {
        source_code: code, language_id: languageId, language: selectedLanguageLabel, problem_id: id, contest_id: contestId || undefined,
      });
      setSubmissionResult(data.submission || null);
    } catch (err) {
      const res = err.response?.data;
      setSubmissionResult({ status: res?.message || "Error", passed_tests: 0, total_tests: 0, run_output: [] });
    } finally { setSubmitting(false); }
  };

  if (!isAuthenticated) return <Navigate to="/auth" />;
  if (loading && !problem) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg-dark)", color: "var(--color-text-muted)" }}>
      Loading...
    </div>
  );
  if (!problem) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg-dark)", color: "var(--color-text-muted)" }}>
      Problem not found.
    </div>
  );

  const testCases = problem.test_cases || [];
  const sampleCases = testCases.filter((t) => t.is_sample);
  const displayCases = sampleCases.length ? sampleCases : testCases.slice(0, 3);
  const difficulty = (problem.difficulty || "MEDIUM").toLowerCase();
  const diffStyle = DIFF_COLOR[difficulty] || DIFF_COLOR.medium;

  const selectedLanguageLabel =
    Object.keys(LANGUAGE_IDS).find((k) => LANGUAGE_IDS[k] === languageId) || "Python 3.8.1";

  return (
    <div style={{ height: "100vh", background: "var(--color-bg-dark)", color: "var(--color-text)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Navbar />

      {/* ── Main split: left description | right editor ── */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>

        {/* LEFT PANEL — problem description */}
        <div style={{ width: "40%", display: "flex", flexDirection: "column", borderRight: "1px solid var(--color-border)", minHeight: 0 }}>

          {/* breadcrumb + title */}
          <div style={{ padding: "0.6rem 1rem 0", fontSize: "0.72rem", color: "var(--color-text-dim)", letterSpacing: "0.05em", flexShrink: 0 }}>
            {contestId ? `JKLU_DAA_CONTEST / PROBLEM` : "PROBLEM"}
          </div>
          <div style={{ padding: "0.25rem 1rem 0.75rem", borderBottom: "1px solid var(--color-border)", flexShrink: 0 }}>
            <h2 style={{ fontWeight: 700, fontSize: "1.2rem", margin: "0 0 0.5rem" }}>{problem.title}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ padding: "0.15rem 0.55rem", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 600, background: diffStyle.bg, color: diffStyle.color }}>
                {problem.difficulty}
              </span>
            </div>
          </div>

          {/* scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "1rem", minHeight: 0 }}>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "1rem", lineHeight: 1.65 }}>
              {problem.description}
            </p>

            {/* Input format */}
            {problem.input_format && (
              <div style={{ background: "rgba(31,41,55,0.5)", borderRadius: "6px", padding: "0.75rem", marginBottom: "1rem" }}>
                <div style={{ color: "var(--color-accent)", fontWeight: 600, fontSize: "0.78rem", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span>📋</span> INPUT FORMAT
                </div>
                <pre style={{ color: "var(--color-text-muted)", fontSize: "0.78rem", whiteSpace: "pre-wrap", margin: 0 }}>
                  {problem.input_format}
                </pre>
              </div>
            )}

            {/* Example */}
            {displayCases.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ color: "var(--color-accent)", fontWeight: 600, fontSize: "0.82rem", marginBottom: "0.5rem" }}>
                  EXAMPLE 1
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <div style={{ color: "var(--color-text-dim)", fontSize: "0.7rem", marginBottom: "0.25rem" }}>INPUT</div>
                    <pre style={{ background: "rgba(31,41,55,0.8)", padding: "0.5rem", borderRadius: "6px", color: "var(--color-text-muted)", fontSize: "0.78rem", whiteSpace: "pre-wrap", margin: 0 }}>
                      {displayCases[0].input}
                    </pre>
                  </div>
                  <div>
                    <div style={{ color: "var(--color-text-dim)", fontSize: "0.7rem", marginBottom: "0.25rem" }}>OUTPUT</div>
                    <pre style={{ background: "rgba(31,41,55,0.8)", padding: "0.5rem", borderRadius: "6px", color: "var(--color-text-muted)", fontSize: "0.78rem", whiteSpace: "pre-wrap", margin: 0 }}>
                      {displayCases[0].expected_output}
                    </pre>
                  </div>
                </div>
                {displayCases[0].explanation && (
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-dim)", marginTop: "0.5rem" }}>
                    {displayCases[0].explanation}
                  </p>
                )}
              </div>
            )}

            {/* Constraints */}
            {problem.constraints && (
              <div style={{ background: "rgba(31,41,55,0.5)", borderRadius: "6px", padding: "0.75rem", marginBottom: "1rem" }}>
                <div style={{ color: "var(--color-accent)", fontWeight: 600, fontSize: "0.78rem", marginBottom: "0.4rem" }}>
                  CONSTRAINTS
                </div>
                <pre style={{ color: "var(--color-text-muted)", fontSize: "0.78rem", whiteSpace: "pre-wrap", margin: 0 }}>
                  {problem.constraints}
                </pre>
              </div>
            )}

            {/* Personal notes */}
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ color: "var(--color-text-dim)", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  ✏️ PERSONAL NOTES
                </span>
                <button
                  type="button"
                  onClick={() => setPersonalNotes("")}
                  style={{ color: "var(--color-text-dim)", fontSize: "0.72rem", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  CLEAR
                </button>
              </div>
              <textarea
                style={{ width: "100%", background: "transparent", color: "var(--color-text-muted)", fontSize: "0.875rem", resize: "none", minHeight: "70px", border: "none", outline: "none" }}
                placeholder="Draft your logic or keep track of edge cases here..."
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — editor + console + buttons */}
        <div style={{ width: "60%", display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>

          {/* Editor toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.4rem 1rem", borderBottom: "1px solid var(--color-border)", background: "var(--color-bg-dark)", flexShrink: 0 }}>
            <select
              value={languageId}
              onChange={handleLanguageChange}
              style={{ background: "var(--color-border)", color: "var(--color-text-muted)", borderRadius: "4px", padding: "0.3rem 0.6rem", fontSize: "0.85rem", border: "none", outline: "none", cursor: "pointer" }}
            >
              {Object.entries(LANGUAGE_IDS).map(([label, lid]) => (
                <option key={lid} value={lid}>{label}</option>
              ))}
            </select>
            <span style={{ fontSize: "0.72rem", color: "var(--color-text-dim)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: autoSaveStatus === "saved" ? "#4caf50" : "#ff9800", display: "inline-block" }} />
              {autoSaveStatus === "saved" ? "AUTOSAVED" : "SAVING..."}
            </span>
          </div>

          {/* Monaco editor — position:relative wrapper so Monaco can fill it */}
          <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0 }}>
              <CodeEditor value={code} onChange={handleCodeChange} language={selectedLanguageLabel} />
            </div>
          </div>

          {/* TestCasesConsole — fixed 260px, scrolls internally */}
          <div style={{ height: "260px", flexShrink: 0, display: "flex", flexDirection: "column", borderTop: "1px solid var(--color-border)" }}>

            {/* Console body — scrollable */}
            <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
              <TestCasesConsole
                testCases={displayCases.length ? displayCases : [{ input: "", expected_output: "" }]}
                runResult={
                  activeTab === "CUSTOM TEST CASE"
                    ? customRunResult
                    : testCasesResult
                }
                submissionResult={submissionResult}
                selectedCaseIndex={selectedCaseIndex}
                onSelectCase={setSelectedCaseIndex}
                customInput={customInput}
                customExpected={customExpected}
                onCustomInputChange={setCustomInput}
                onCustomExpectedChange={setCustomExpected}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                running={running}
              />
            </div>

            {/* Action buttons */}
            <div style={{ flexShrink: 0, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.75rem", padding: "0.6rem 1rem", borderTop: "1px solid var(--color-border)", background: "var(--color-bg-dark)" }}>
              <button
                type="button"
                onClick={() => handleRun()}
                disabled={running}
                style={{ padding: "0.45rem 1.25rem", borderRadius: "4px", fontWeight: 500, border: "none", cursor: running ? "not-allowed" : "pointer", background: "#2d333b", color: "#cdd9e5", opacity: running ? 0.5 : 1, fontSize: "0.875rem" }}
              >
                {running ? "Running..." : "RUN CODE"}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                style={{ padding: "0.45rem 1.25rem", borderRadius: "4px", fontWeight: 600, border: "none", cursor: submitting ? "not-allowed" : "pointer", background: "#fbbf24", color: "#0d1117", opacity: submitting ? 0.5 : 1, fontSize: "0.875rem" }}
              >
                {submitting ? "Submitting..." : "SUBMIT"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}