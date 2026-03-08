import React, { useState } from "react";
import "./TestCasesConsole.css";

const tabs = ["TEST CASES", "CONSOLE", "RESULT"];

const normalize = (str) => String(str || "").replace(/\r\n/g, "\n").trimEnd();

export default function TestCasesConsole({
  testCases = [],
  runResult = null,
  submissionResult = null,
  selectedCaseIndex = 0,
  onSelectCase,
}) {
  const [activeTab, setActiveTab] = useState("TEST CASES");
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
    if (runResult && index === 0) {
      const actual = normalize(runResult.stdout);
      const expected = normalize(testCases[0]?.expected_output);
      if (actual) return actual === expected ? "pass" : "fail";
      return runResult.status === "Accepted" ? "pass" : "fail";
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

  return (
    <div className="test-cases-console">
      <div className="test-cases-console__tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`test-cases-console__tab ${
              activeTab === tab ? "test-cases-console__tab--active" : ""
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="test-cases-console__body">
        {activeTab === "TEST CASES" && (
          <div className="test-cases-console__row">
            <div className="test-cases-console__case-list">
              {testCases.length === 0 ? (
                <p style={{ color: "var(--color-muted)", padding: "8px" }}>
                  No test cases available.
                </p>
              ) : (
                testCases.map((_, i) => {
                  const status = getCaseStatus(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onSelectCase?.(i)}
                      className={`test-cases-console__case-btn ${
                        selectedCaseIndex === i
                          ? "test-cases-console__case-btn--selected"
                          : ""
                      }`}
                    >
                      {status === "pass" && (
                        <span style={{ color: "var(--color-success)" }}>✓ </span>
                      )}
                      {status === "fail" && (
                        <span style={{ color: "var(--color-error)" }}>✗ </span>
                      )}
                      {status === "locked" && <span>🔒 </span>}
                      Case {i + 1}
                    </button>
                  );
                })
              )}
            </div>

            {selectedCase ? (
              <div className="test-cases-console__case-details">
                <div>
                  <div className="test-cases-console__label">INPUT</div>
                  <pre className="test-cases-console__pre">
                    {selectedCase.input || "(none)"}
                  </pre>
                </div>
                <div>
                  <div className="test-cases-console__label">EXPECTED OUTPUT</div>
                  <pre className="test-cases-console__pre">
                    {normalize(selectedCase.expected_output) || "(none)"}
                  </pre>
                </div>
                {hasResult && yourOutput !== null && (
                  <div>
                    <div className="test-cases-console__label">YOUR OUTPUT</div>
                    <pre className="test-cases-console__pre">
                      {yourOutput || "(no output)"}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: "var(--color-muted)", padding: "8px" }}>
                Select a test case.
              </p>
            )}
          </div>
        )}

        {activeTab === "CONSOLE" && (
          <pre className="test-cases-console__console-pre">
            {runResult?.case_results?.[0]?.stderr ||
              runResult?.case_results?.[0]?.compile_output ||
              runResult?.stderr ||
              runResult?.compile_output ||
              "No console output."}
          </pre>
        )}

        {activeTab === "RESULT" && (
          <div className="test-cases-console__console-pre">
            {submissionResult ? (
              <p
                className={
                  submissionResult.status === "Accepted"
                    ? "test-cases-console__result--pass"
                    : "test-cases-console__result--fail"
                }
              >
                {submissionResult.status} — {submissionResult.passed_tests}/
                {submissionResult.total_tests} test cases passed.
              </p>
            ) : runResult ? (
              <p
                className={
                  getCaseStatus(0) === "pass"
                    ? "test-cases-console__result--pass"
                    : "test-cases-console__result--fail"
                }
              >
                {getCaseStatus(0) === "pass" ? "Accepted" : "Wrong Answer"}
              </p>
            ) : (
              <p className="test-cases-console__result--muted">
                Run or submit to see result.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}