export const fileTypes = {
  app: "app",
  component: "component",
  primitive: "primitive",
  hook: "hook",
  routine: "routine",
  context: "context",
};

export type FileType = keyof typeof fileTypes;
