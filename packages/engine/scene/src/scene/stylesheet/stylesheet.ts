import { TextCssStyleSheet } from "@elllphnt/elementa-models";
import { of } from "rxjs";

const text = /*css*/ `
  .system {
    font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

    &.route-view {
      font-size: 14px;
      border-radius: 8px;

      &.pending {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        color: #555;

        .loader {
          width: 24px;
          height: 24px;
          border: 3px solid #ccc;
          border-top-color: #333;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .message {
          font-style: italic;
        }
      }

      &.error,
      &.missing {
        color: #b00020;
        background: #fff5f5;
        border: 1px solid #ffcccc;
        padding: 1rem;

        h2 {
          margin-top: 0;
        }

        pre {
          background: #ffecec;
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 13px;
          overflow-x: auto;
        }
      }

      &.resolved {
        padding: 0;
        background: transparent;
      }
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const systemStylesheet = new TextCssStyleSheet({
  target: "system",
  text: () => text,
  text$: () => of(text),
});
