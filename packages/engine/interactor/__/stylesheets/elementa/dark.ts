import { Theme } from "../../theme/theme.js";

export const darkModeStyleSheet = (theme: Theme) => /* css */ `
    @media (prefers-color-scheme: dark) {
        html, body {
            background-color: ${theme.dark.background};
        }

        .elementa-grid-hline {
            background-color: ${theme.dark.grid};
        }
        .elementa-grid-vline {
            background-color: ${theme.dark.grid};
        }
        .elementa-layer-handle{
            color: ${theme.dark.text};
        }
        .elementa-selection{
            outline-color: ${theme.dark.selection};
        }
    }
`;
