import { ImageMediaData, MediaElementData } from "@elllphnt/elll-element";
import { TranspilerContext, TranspilerResult } from "../../types/transpiler.js";
import { transpileDynamic } from "../dynamic.js";
import { compileStylesheet } from "../style/style.js";

export function transpileImageMediaElement(
  data: MediaElementData,
  context: TranspilerContext,
): TranspilerResult {
  const media = data.media as ImageMediaData;
  const classes = compileStylesheet(data.stylesheet ?? {});
  const classesCode = classes.join(" ");
  const fit = data.fit ? transpileDynamic(data.fit, context) : undefined;
  const src = media.src
    ? transpileDynamic(
        typeof media.src === "string"
          ? {
              __reference: {
                type: "drive-file",
                id: (() => {
                  const [, drive, file] = media.src.split(":");
                  return `dfl_${drive}_${file}`;
                })(),
              },
            }
          : media.src,
        context,
      )
    : undefined;
  const position = data.position
    ? transpileDynamic(data.position, context)
    : undefined;

  return {
    generate: (env) => {
      const propParts: string[] = [];
      const styleParts: string[] = [];

      if (classesCode) {
        propParts.push(`className="${classesCode}"`);
      }
      if (src) {
        propParts.push(`src={${src.generate(env)}}`);
      }
      if (fit) {
        styleParts.push(`objectFit: ${fit.generate(env)}`);
      }
      if (position) {
        styleParts.push(`objectPosition: ${position.generate(env)}`);
      }
      if (styleParts.length) {
        propParts.push(`style={{${styleParts.join(", ")}}}`);
      }

      const propCode = propParts.join(" ");

      return [`<img ${propCode} />`].join("");
    },
  };
}

export function transpileVideoMediaElement(
  data: MediaElementData,
  context: TranspilerContext,
): TranspilerResult {
  const classes = compileStylesheet(data.stylesheet ?? {});
  const classesCode = classes.join(" ");

  return {
    generate: () => {
      return `<></>`;
    },
  };
}

export function transpileMediaElement(
  data: MediaElementData,
  context: TranspilerContext,
): TranspilerResult {
  switch (data.media?.type) {
    case "image":
      return transpileImageMediaElement(data, context);
    case "video":
      return transpileVideoMediaElement(data, context);
    default:
      return {
        generate: () => "<></>",
      };
  }
}
