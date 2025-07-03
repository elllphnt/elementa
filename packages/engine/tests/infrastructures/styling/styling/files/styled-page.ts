import type { ComponentData } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { TestFileData } from "~/infrastructure.js";

export const styledPageData: ComponentData = {
  name: "StyledPage",
  template: {
    id: genId(),
    type: "container",
    stylesheet: {
      styles: {
        container: {
          __raw: {
            padding: "2rem",
            fontFamily: "Arial, sans-serif",
          },
        },
        title: {
          __raw: {
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#333",
            marginBottom: "1rem",
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
      },
    },
    content: [
      {
        id: genId(),
        type: "text",
        text: "Welcome to Styled Page",
        stylesheet: {
          styles: {
            self: {
              __raw: {
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#007bff",
              },
            },
          },
        },
      },
      {
        id: genId(),
        type: "container",
        stylesheet: {
          styles: {
            self: {
              __raw: {
                backgroundColor: "#f8f9fa",
                padding: "1rem",
                borderRadius: "0.5rem",
              },
            },
          },
        },
        content: [
          {
            id: genId(),
            type: "text",
            text: "This is a styled container",
          },
        ],
      },
    ],
  },
};

export const styledPageFileData: TestFileData = {
  id: genId(),
  path: "styled-page",
  content: JSON.stringify(styledPageData, null, 2),
};
