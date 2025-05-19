import { RouteLinkData } from "@elllphnt/elementa-base";
import { transpileDynamic } from "~/libs/dynamic.js";
import { TranspilerContext, TranspilerResult } from "~/types/transpiler.js";
import { TranspileElementOptions } from "../../_base.js";
import { TranspilerDiagnosticLevel } from "~/types/diagnostic.js";
import { applyBaseLinkToTranspiledElement } from "./_base.js";

export function applyRouteLinkToTranspiledElement(
  link: RouteLinkData,
  element: TranspilerResult<[TranspileElementOptions]>,
  context: TranspilerContext
): TranspilerResult<[TranspileElementOptions]> {
  if (!link.routeUrl) {
    context.addDiagnostic?.({
      level: TranspilerDiagnosticLevel.Warning,
      message: "Missing routeUrl for route link",
      data: link,
    });
    return element;
  }

  const route = context.useRoute(link.routeUrl);

  // Props passed to <Link>
  const props: Record<string, TranspilerResult> = {
    path: {
      generate: (env) => JSON.stringify(env.getRoutePath(route.key)),
    },
  };

  if (link.params) {
    const params = link.params;
    props["params"] = {
      generate: (env) =>
        `{ ${Object.entries(params)
          .map(
            ([k, v]) =>
              `${JSON.stringify(k)}: ${transpileDynamic(v, context).generate(
                env
              )}`
          )
          .join(", ")} }`,
    };
  }

  if (link.query) {
    const query = link.query;
    props["query"] = {
      generate: (env) =>
        `{ ${Object.entries(query)
          .map(
            ([k, v]) =>
              `${JSON.stringify(k)}: ${transpileDynamic(v, context).generate(
                env
              )}`
          )
          .join(", ")} }`,
    };
  }

  if (link.state) {
    const state = link.state;
    props["state"] = {
      generate: (env) =>
        `{ ${Object.entries(state)
          .map(
            ([k, v]) =>
              `${JSON.stringify(k)}: ${transpileDynamic(v, context).generate(
                env
              )}`
          )
          .join(", ")} }`,
    };
  }

  const routerDep = context.useDependency({
    url: "@elllphnt/elementa-router",
    specifier: "Link",
    name: { capitalize: true },
  });

  const wrapped = applyBaseLinkToTranspiledElement(link, element, context);

  return {
    generate: (env, elementUpstream) =>
      wrapped.generate(env, elementUpstream, {
        tag: env.getName(routerDep.key),
        props,
      }),
  };
}
