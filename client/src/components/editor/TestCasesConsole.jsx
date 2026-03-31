import React from "react";

const tabs = ["TEST CASES", "CUSTOM TEST CASE", "CONSOLE"];

const normalize = (str) => String(str || "").replace(/\r\n/g, "\n").trimEnd();

const preStyle = {
  background: "rgba(31,41,55,0.8)",
  padding: "0.5rem 0.75rem",
  borderRadius: "4px",
  color: "var(--color-text-muted)",
  fontSize: "0.875rem",
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
  margin: 0,
};

const labelStyle = {
  color: "var(--color-text-dim)",
  fontSize: "0.75rem",
  marginBottom: "0.25rem",
};

const textareaStyle = {
  width: "100%",
  background: "rgba(31,41,55,0.8)",
  border: "1px solid var(--color-border)",
  borderRadius: "4px",
  color: "var(--color-text-muted)",
  fontSize: "0.875rem",
  fontFamily: "ui-monospace, monospace",
  padding: "0.5rem 0.75rem",
  resize: "vertical",
  outline: "none",
  minHeight: "70px",
  boxSizing: "border-box",
};

export default function TestCasesConsole({
  testCases = [],
  runResult = null,
  submissionResult = null,
  selectedCaseIndex = 0,
  onSelectCase,
  customInput = "",
  customExpected = "",
  onCustomInputChange,
  onCustomExpectedChange,
  activeTab = "TEST CASES",
  onTabChange,
  running = false,
}) {
  const selectedCase = testCases[selectedCaseIndex];

  const getCaseStatus = (index) => {
    if (submissionResult?.run_output?.length) {
      const out = submissionResult.run_output[index];
      if (!out) return "locked";
      return out.status === "Accepted" ? "pass" : "fail";
    }
    if (runResult?.case_results?.length) {
      const c = runResult.case_results[index];
      if (!c) return "neutral";
      return c.status === "Accepted" ? "pass" : "fail";
    }
    return "neutral";
  };

  const getYourOutput = () => {
    if (submissionResult?.run_output?.[selectedCaseIndex]) {
      const out = submissionResult.run_output[selectedCaseIndex];
      return normalize(out.stdout) || normalize(out.stderr) || "";
    }
    if (runResult?.case_results?.[selectedCaseIndex]) {
      const c = runResult.case_results[selectedCaseIndex];
      return normalize(c.stdout) || normalize(c.stderr) || "";
    }
    if (runResult && selectedCaseIndex === 0) {
      return normalize(runResult.stdout) || normalize(runResult.stderr) || "";
    }
    return null;
  };

  const yourOutput = getYourOutput();
  const hasResult = runResult || submissionResult;

  const consoleOutput =
    runResult?.case_results?.[0]?.stderr ||
    runResult?.case_results?.[0]?.compile_output ||
    runResult?.stderr ||
    runResult?.compile_output ||
    null;

  return (
    <div style={{ background: "var(--color-bg-card)", borderTop: "1px solid var(--color-border)", display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", flexShrink: 0 }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange?.(tab)}
            style={{
              padding: "0.6rem 1rem",
              fontSize: "0.8rem",
              fontWeight: 500,
              background: "none",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid var(--color-accent)" : "2px solid transparent",
              color: activeTab === tab ? "var(--color-accent)" : "var(--color-text-dim)",
              cursor: "pointer",
              marginBottom: "-1px",
              letterSpacing: "0.03em",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ padding: "0.75rem 1rem", flex: 1, overflowY: "auto", minHeight: 0 }}>

        {/* ── TEST CASES ── */}
        {activeTab === "TEST CASES" && (
          <div style={{ display: "flex", gap: "1rem", height: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", minWidth: "110px", flexShrink: 0 }}>
              {testCases.length === 0 ? (
                <p style={{ color: "var(--color-text-dim)", fontSize: "0.8rem" }}>No test cases.</p>
              ) : (
                testCases.map((_, i) => {
                  const status = getCaseStatus(i);
                  const isSelected = selectedCaseIndex === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onSelectCase?.(i)}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.4rem",
                        padding: "0.4rem 0.7rem", borderRadius: "4px", border: "none",
                        background: isSelected ? "var(--color-border)" : "none",
                        color: isSelected ? "var(--color-text)" : "var(--color-text-muted)",
                        fontSize: "0.85rem", textAlign: "left", cursor: "pointer",
                      }}
                    >
                      {status === "pass" && <span style={{ color: "var(--color-success)" }}>✓</span>}
                      {status === "fail" && <span style={{ color: "var(--color-error)" }}>✗</span>}
                      {status === "locked" && <span>🔒</span>}
                      Case {i + 1}
                    </button>
                  );
                })
              )}
            </div>

            {selectedCase ? (
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <div>
                  <div style={labelStyle}>INPUT</div>
                  <pre style={preStyle}>{selectedCase.input || "(none)"}</pre>
                </div>
                <div>
                  <div style={labelStyle}>EXPECTED OUTPUT</div>
                  <pre style={preStyle}>{normalize(selectedCase.expected_output) || "(none)"}</pre>
                </div>
                {hasResult && yourOutput !== null && (
                  <div>
                    <div style={labelStyle}>YOUR OUTPUT</div>
                    <pre style={preStyle}>{yourOutput || "(no output)"}</pre>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: "var(--color-text-dim)", fontSize: "0.8rem" }}>Select a test case.</p>
            )}
          </div>
        )}

        {/* ── CUSTOM TEST CASE ── */}
        {activeTab === "CUSTOM TEST CASE" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <div style={labelStyle}>YOUR INPUT</div>
              <textarea
                style={textareaStyle}
                placeholder="Enter custom input here..."
                value={customInput}
                onChange={(e) => onCustomInputChange?.(e.target.value)}
              />
            </div>

            {runResult && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div>
                  <div style={labelStyle}>YOUR OUTPUT</div>
                  <pre style={preStyle}>
                    {normalize(runResult.case_results?.[0]?.stdout) ||
                      normalize(runResult.stdout) ||
                      normalize(runResult.case_results?.[0]?.stderr) ||
                      normalize(runResult.stderr) ||
                      "(no output)"}
                  </pre>
                </div>
              </div>
            )}

            {!runResult && (
              <p style={{ color: "var(--color-text-dim)", fontSize: "0.8rem", margin: 0 }}>
                Press RUN CODE to run with this input.
              </p>
            )}
          </div>
        )}

        {/* ── CONSOLE (merged console + result) ── */}
        {activeTab === "CONSOLE" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>

            {submissionResult && (
              <div style={{
                padding: "0.6rem 0.9rem", borderRadius: "4px", fontWeight: 600, fontSize: "0.875rem",
                background: submissionResult.status === "Accepted" ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                color: submissionResult.status === "Accepted" ? "var(--color-success)" : "var(--color-error)",
                border: `1px solid ${submissionResult.status === "Accepted" ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
              }}>
                {submissionResult.status} — {submissionResult.passed_tests}/{submissionResult.total_tests} test cases passed
              </div>
            )}

            {!submissionResult && runResult && (
              <div style={{
                padding: "0.6rem 0.9rem", borderRadius: "4px", fontWeight: 600, fontSize: "0.875rem",
                background: getCaseStatus(0) === "pass" ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                color: getCaseStatus(0) === "pass" ? "var(--color-success)" : "var(--color-error)",
                border: `1px solid ${getCaseStatus(0) === "pass" ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
              }}>
                {getCaseStatus(0) === "pass" ? "Accepted" : runResult.status || "Wrong Answer"}
              </div>
            )}

            {consoleOutput && (
              <div>
                <div style={labelStyle}>CONSOLE / ERRORS</div>
                <pre style={{ ...preStyle, color: "#f87171" }}>{consoleOutput}</pre>
              </div>
            )}

            {!submissionResult && !runResult && (
              <p style={{ color: "var(--color-text-dim)", fontSize: "0.8rem", margin: 0 }}>
                Run or submit your code to see output here.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}