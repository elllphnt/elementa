import { ImageMediaContentData } from "@elllphnt/elll-element";
import { compileBaseElement } from "./_/base.js";
import { ComponentCompilerContext } from "../../types/component.js";
import { CompilerResult } from "../../types/compiler.js";
import { compileEvaluable } from "../_lib/expression.js";

// export function compileImageElement(
//   data: MediaElementData,
//   context: ComponentCompilerContext,
//   meta?: ElementCompilerMeta
// ): CompilerResult {
//   if (!data.src) {
//     console.warn("Image element has no source", data._id);
//     return {
//       generate: () => "<></>",
//     };
//   }

//   const { generateClassName, generateStyle } = compileElementStyle(
//     {
//       style: data.style,
//     },
//     context
//   );

//   return {
//     generate: (names) => {
//       const className = generateClassName(names);
//       const style = generateStyle(names);
//       const src = data.src || "";

//       return [
//         `<div className="${className}" style={${style}}>`,
//         `<img src="${src}" />`,
//         `</div>`,
//       ].join("\n");
//     },
//   };
// }

// export function compileVideoElement(
//   data: MediaElementData,
//   context: ComponentCompilerContext,
//   meta?: ElementCompilerMeta
// ): CompilerResult {
//   if (!data.src) {
//     console.warn("Image element has no source", data._id);
//     return {
//       generate: () => "<></>",
//     };
//   }

//   const { generateClassName, generateStyle } = compileElementStyle(
//     data,
//     context
//   );

//   return {
//     generate: (names) => {
//       const className = generateClassName(names);
//       const style = generateStyle(names);
//       const src = data.src || "";

//       return [
//         `<div className="${className}" style={${style}}>`,
//         `<video src="${src}" />`,
//         `</div>`,
//       ].join("\n");
//     },
//   };
// }

export function compileImageMediaContent(
  data: ImageMediaContentData,
  context: ComponentCompilerContext
): CompilerResult {
  const src = compileEvaluable(data.src, context);
  return {
    generate: () => {
      const propCodes: string[] = ["style={{width: '100%'}}"];
      const srcCode = src.generate();
      if (srcCode) {
        propCodes.push(`src={${srcCode}}`);
      }
      return ["<img ", propCodes.join(" "), "/>"].join("");
    },
  };
}

export function compileVideoMediaContent(
  data: VideoMediaContentData,
  context: ComponentCompilerContext
): CompilerResult {
  const src = compileEvaluable(data.src, context);
  return {
    generate: () => {
      const propCodes: string[] = [
        "autoPlay",
        "loop",
        "muted",
        "style={{width: '100%'}}",
      ];
      const srcCode = src.generate();
      if (srcCode) {
        propCodes.push(`src={${srcCode}}`);
      }
      return ["<video ", propCodes.join(" "), "/>"].join("");
    },
  };
}

export function compileMediaContent(
  data: MediaContentData,
  context: ComponentCompilerContext
): CompilerResult {
  switch (data.type) {
    case "image":
      return compileImageMediaContent(data, context);
    case "video":
      return compileVideoMediaContent(data, context);
    default:
      return {
        generate: () => "<></>",
      };
  }
}

export function compileMediaElement(
  data: MediaElementData,
  context: ComponentCompilerContext,
  meta?: ElementCompilerMeta
): CompilerResult {
  const content = data.content
    ? compileMediaContent(data.content, context)
    : undefined;

  return compileBaseElement({
    data,
    context,
    meta: {
      ...meta,
      props: {
        ...meta?.props,
        style: {
          ...meta?.props?.style,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        },
      },
    },
    content: {
      generate: (names) => {
        return content?.generate(names) || "";
      },
    },
  });
}
