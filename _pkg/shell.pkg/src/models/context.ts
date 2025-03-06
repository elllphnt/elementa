export type Context = {
  id: string;
  name: string;
  panel: {
    viewId: string;
  };
  priority?: number;
  icon?: string;
};
