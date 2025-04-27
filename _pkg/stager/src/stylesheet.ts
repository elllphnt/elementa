import { resetCss } from "@elllphnt/elementa-base";

export type ColorPalette = {
  backgroundColor: string;
};
export type Theme = {
  light: ColorPalette;
  dark: ColorPalette;
};

export const css = (theme: Theme) =>
  resetCss() +
  /* css */ `
    @layer content, editor;
    
    html, body {
        height: 100vh;
        width: 100vw;
        margin: 0;
        padding: 0;
        overflow: hidden;
        user-select: none;
        font-family: Arial, sans-serif;
        background-color: ${theme.light.backgroundColor};
    }

    *::-webkit-scrollbar {
        display: none;
    }   
        
    .elementa-stage {
        height: 100%;
        width: 100%;
    }

    .elementa {
        height: 100%;
        width: 100%;
        --vh-unit: 1vh;
        --vw-unit: 1vw;
    }

    .elementa-viewport {
        position: fixed;
        inset: 0;
        overflow: hidden;
    }

    .elementa-content {
        position: absolute;
        top: 50%;
        left: 50%;
        height:0;
        width: 0;
        overflow: visible;
    }
        
    .elementa-content * {
        pointer-events: none;
        transition: none !important;
    }

    .elementa-element-slot-empty > * {
        opacity: 0.3 !important;
    }

    @media(prefers-color-scheme: dark) {
        html, body {
            background-color: ${theme.dark.backgroundColor};
        }
    }

    img {
        display: block;
    }
`;
