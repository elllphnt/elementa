import type { StyleSheetData } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { TestFileData } from "~/infrastructure.js";

export const stylesheetData: StyleSheetData = {
  styles: {
    title: {
      __raw: {
        fontSize: "2rem",
        fontWeight: "bold",
        color: "#333",
        marginBottom: "1rem",
      },
    },
    primary: {
      __raw: {
        color: "#007bff",
      },
    },
    card: {
      __raw: {
        backgroundColor: "#f8f9fa",
        border: "1px solid #dee2e6",
        borderRadius: "0.5rem",
        padding: "1rem",
        margin: "1rem 0",
      },
    },
    body: {
      __raw: {
        fontSize: "1rem",
        lineHeight: "1.5",
        color: "#666",
      },
    },
    button: {
      __raw: {
        backgroundColor: "#007bff",
        color: "white",
        padding: "0.5rem 1rem",
        border: "none",
        borderRadius: "0.25rem",
        cursor: "pointer",
        display: "inline-block",
      },
    },
  },
  fragments: [
    {
      id: genId(),
      type: "animation" as any,
      data: {
        name: "hoverEffect",
        keyframes: {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0.8", transform: "scale(1.05)" },
        },
      },
    },
  ],
  conditions: {
    mobile: "@media (max-width: 768px)",
    dark: "@media (prefers-color-scheme: dark)",
  },
};

export const stylesheetFileData: TestFileData = {
  id: genId(),
  path: "styles/main.css",
  content: JSON.stringify(stylesheetData, null, 2),
};
