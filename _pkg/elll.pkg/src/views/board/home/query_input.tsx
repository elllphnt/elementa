"use client";

import { ProgressBar } from "@repo/components";
import cx from "classnames";
import { useCallback, useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { generateProject } from "~/src/commands/generate_project";
import { useElll } from "~/src/hooks/elll/elll";
import { buildPrompt } from "~/src/libs/ai_generation/prompt";
import { getElllephantApiClient } from "~/src/libs/ai_generation/utils";

type QueryData = {
  type: string;
  title: string;
  query: string;
};

const projectTypes: Array<{ type: string; description: string; name: string }> =
  [
    {
      type: "webapp",
      name: "Web Application",
      description: "An interactive application that runs on a web browser.",
    },
    {
      type: "website",
      name: "Website",
      description:
        "A set of primarily static web pages with informational content.",
    },
  ];

export default function QueryInput() {
  const elll = useElll();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<QueryData[]>([]);
  const [error, setError] = useState<string | undefined>();

  const runGenerateWorkspace = useCallback(
    async (query: string) => {
      try {
        setError(undefined);
        setLoading(true);
        const client = getElllephantApiClient(elll);
        const prompt = await buildPrompt({
          query,
          client,
          projectTypes,
        });

        if (prompt.type === "invalid") {
          setError(
            "Invalid query. Please provide a valid query to generate a software project.",
          );
        } else if (prompt.type === "other") {
          setError(
            `Sorry we only support the following project types for now: ${projectTypes.map((p) => p.name).join(", ")}.`,
          );
        } else {
          console.log("Prompt", prompt);
          await generateProject({
            elll,
            prompt,
          });
        }
      } catch (error) {
        setError(
          "An error occurred while generating the project. Please try again later.",
        );
      } finally {
        setLoading(false);
      }
    },
    [query],
  );

  const handleSubmit = useCallback(async () => {
    if (!query.trim()) return;
    runGenerateWorkspace(query.trim());
  }, [query]);

  useEffect(() => {
    const initialQuery = elll.config<string>("initialQuery");
    const getSuggestionQueries = elll.config<
      (count: number) => Promise<QueryData[]>
    >("getSuggestionQueries");

    if (typeof initialQuery === "string") {
      elll.setConfig("initialQuery", undefined);
      setQuery(initialQuery);
      runGenerateWorkspace(initialQuery);
    }
    if (getSuggestionQueries) {
      getSuggestionQueries(3).then(setSuggestions);
    }
  }, [elll]);

  return (
    <div className="el-w-full el-space-y-3">
      <div className="el-relative el-border el-w-full el-rounded-lg el-h-fit el-flex el-gap-3 el-items-end el-overflow-hidden">
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

      <div
        className={cx(
          "el-flex el-flex-wrap el-gap-2 el-transition-all el-duration-300",
          {
            "el-opacity-100": suggestions?.length,
            "el-opacity-0": !suggestions?.length,
          },
        )}
        style={{ minHeight: 24 }}
      >
        {suggestions?.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => setQuery(suggestion.query)}
            className="el-text-sm el-text-fg/50 el-rounded-full el-px-3 el-py-1 el-bg-fg/5 el-transition-colors hover:el-bg-fg/10"
          >
            {suggestion.title}
          </button>
        ))}
      </div>

      {error ? (
        <p className="el-bg-red/10 el-p-2 el-rounded-md el-text-red">{error}</p>
      ) : (
        <></>
      )}
    </div>
  );
}
