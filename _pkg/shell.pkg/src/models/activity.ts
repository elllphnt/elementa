export type ActivityType = "primary" | "secondary";

export type Activity = {
  id: string;
  type: ActivityType;
  name: string;
  panel: {
    viewId: string;
  };
  priority?: number;
  icon?: string;
};
