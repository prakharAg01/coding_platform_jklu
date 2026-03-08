import fetch from "node-fetch";

const JUDGE0_URL = process.env.JUDGE0_API_URL || "http://localhost:2358";

const JUDGE0_STATUS = {
  1: "Processing",
  2: "Processing",
  3: "Accepted",
  4: "Wrong Answer",
  5: "Time Limit Exceeded",
  6: "Compilation Error",
  7: "Runtime Error",
  8: "Runtime Error",
  9: "Runtime Error",
  10: "Runtime Error",
  11: "Runtime Error",
  12: "Runtime Error",
  13: "Runtime Error",
  14: "Runtime Error",
  15: "Runtime Error",
};

export function normalizeStatus(statusId, description) {
  if (description === "Accepted") return "Accepted";
  if (description === "Wrong Answer") return "Wrong Answer";
  if (description === "Time Limit Exceeded") return "Time Limit Exceeded";
  if (description === "Compilation Error") return "Compilation Error";
  if (description?.includes("Runtime")) return "Runtime Error";
  return JUDGE0_STATUS[statusId] || "Runtime Error";
}

async function submitToJudge0(body) {
  const url = `${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Judge0 error ${res.status}: ${text}`);
  }
  const data = await res.json();
  const token = data.token;
  if (!token) throw new Error("Judge0 did not return a token");
  return token;
}

async function pollResult(token, maxWaitMs = 30000) {
  const step = 1000;
  let elapsed = 0;

  await new Promise((r) => setTimeout(r, 1000));

  while (elapsed < maxWaitMs) {
    try {
      const res = await fetch(
        `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`,
        { headers: { "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error(`Judge0 poll error ${res.status}`);
      const result = await res.json();
      const id = result.status?.id;
      const description = result.status?.description || "";

      console.log(`Polling token ${token}: status id=${id} description=${description}`);

      const stillProcessing =
        description === "In Queue" ||
        description === "Processing" ||
        description === "In Queue (Compilation)";

      if (id !== null && id !== undefined && !stillProcessing) {
        return result;
      }
    } catch (err) {
      console.error("Poll error:", err.message);
    }

    await new Promise((r) => setTimeout(r, step));
    elapsed += step;
  }

  throw new Error("Judge0 submission timed out after 30s");
}

export async function createSubmission(sourceCode, languageId, stdin) {
  const token = await submitToJudge0({
    source_code: sourceCode,
    language_id: languageId,
    stdin: stdin || "",
  });
  return pollResult(token);
}

export async function createSubmissionWithLimits(sourceCode, languageId, stdin, limits = {}) {
  const token = await submitToJudge0({
    source_code: sourceCode,
    language_id: languageId,
    stdin: stdin || "",
    ...limits,
  });
  return pollResult(token);
}

export async function getSubmission(token) {
  const res = await fetch(
    `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`,
    { headers: { "Content-Type": "application/json" } }
  );
  if (!res.ok) throw new Error(`Judge0 get error ${res.status}`);
  return res.json();
}

export async function runWithPolling(sourceCode, languageId, stdin, maxWaitMs = 30000) {
  const token = await submitToJudge0({
    source_code: sourceCode,
    language_id: languageId,
    stdin: stdin || "",
  });
  const result = await pollResult(token, maxWaitMs);
  return {
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    compile_output: result.compile_output || "",
    status: normalizeStatus(result.status?.id, result.status?.description),
    time: result.time,
    memory: result.memory,
  };
}

export const executeCode = async (source_code, language_id) => {
  return createSubmission(source_code, language_id, "");
};