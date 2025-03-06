import { View } from "@repo/shell";
import { AppBarView } from "./app_bar";

export const appBarViews = {
  default: {
    id: "elll.view.app_bar.default",
    render: AppBarView,
  },
} satisfies Record<string, View>;
