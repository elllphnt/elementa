export const Webfont = (() => {
  if (typeof window === "undefined") return undefined;
  return import("webfontloader");
})();
