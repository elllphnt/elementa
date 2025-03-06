"use client";

import { ProgressBar } from "@repo/components";
import { useCallback, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useElll } from "~/src/hooks/elll/elll";

export default function QueryInput() {
  const elll = useElll();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      await elll.generateWorkspace({ query: query.trim() });
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="el-relative el-border el-w-full el-rounded-lg el-h-fit el-flex el-text-sm el-gap-3 el-items-end el-overflow-hidden">
      <div
        className="el-grow el-flex el-items-center"
        style={{ minHeight: 54 }}
      >
        <TextareaAutosize
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          maxRows={6}
          placeholder="Describe what you want to build..."
          className="el-w-full el-resize-none el-bg-transparent el-outline-none el-h-fit el-p-3 el-pr-0"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
      </div>
      <div className="el-p-3 el-flex el-justify-between">
        <button
          className="el-h-7 el-w-7 disabled:el-bg-fg/10 disabled:el-text-fg/50 el-bg-fg hover:el-bg-fg-400 el-text-bg el-rounded-md el-flex el-items-center el-justify-center el-transition-colors"
          disabled={!query.trim()}
          onClick={handleSubmit}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 256 256"
            fill="currentColor"
            className="el-rotate-90"
          >
            <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z"></path>
          </svg>
        </button>
      </div>

      <div
        className="el-transition-opacity"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          opacity: loading ? 1 : 0,
        }}
      >
        <ProgressBar height={1} />
      </div>
    </div>
  );
}
