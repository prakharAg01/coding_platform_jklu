import React from "react";
import Editor from "@monaco-editor/react";

export const LANGUAGE_IDS = { "Python 3.8.1": 71, "JavaScript": 63, "C": 50, "Java": 62 };

const MONACO_LANGUAGE_MAP = {
  "Python 3.8.1": "python",
  "JavaScript": "javascript",
  "C": "c",
  "Java": "java",
};

export default function CodeEditor({ value, onChange, language = "Python 3.8.1" }) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Editor
        height="100%"
        width="100%"
        theme="vs-dark"
        language={MONACO_LANGUAGE_MAP[language] || "python"}
        value={value}
        onChange={(val) => onChange(val)}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}