export type StackTrace = {
  readonly raw: string;
  readonly sanitized: string;
};

export function getStackTrace(): StackTrace {
  const error = new Error();

  return Object.freeze({
    get raw() {
      if (!error.stack) {
        return "No stack trace available";
      }
      return error.stack;
    },
    get sanitized() {
      const stack = error.stack;
      if (!stack) {
        return "No clean stack trace available";
      }
      const lines = stack.split("\n");
      return lines
        .slice(2) // Skip 'Error' and this function's frame
        .filter((line) => !line.includes("node_modules")) // Optional noise filter
        .join("\n");
    },
  });
}
