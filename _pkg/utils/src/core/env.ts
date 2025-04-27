const env =
  (typeof process !== "undefined" && process.env?.__ENV__) ||
  // @ts-ignore
  (typeof Deno !== "undefined" && Deno.env?.get?.("__ENV__")) ||
  // @ts-ignore
  (typeof window !== "undefined" && (window as any).__ENV__) ||
  "development";

export const __ENV__ = env as "development" | "production" | "test";

export const isDev = __ENV__ === "development";
export const isProd = __ENV__ === "production";
export const isTest = __ENV__ === "test";
