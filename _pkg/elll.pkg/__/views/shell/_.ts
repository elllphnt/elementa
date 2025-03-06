import { View } from "@repo/shell";
import { AppBarView } from "./app_bar";
import { BoardPlaceholderView } from "./board_placeholder/board_placeholder";
import { ContextPanelPlaceholderView } from "./context_panel_placeholder/context_panel_placeholder";

export const shellViews = {
  appbar: {
    id: "elll.view.app-bar",
    render: AppBarView,
  },
  boardPlaceholder: {
    id: "elll.view.board.placeholder",
    render: BoardPlaceholderView,
  },
  contextPanelPlaceholder: {
    id: "elll.view.contextPanel.placeholder",
    render: ContextPanelPlaceholderView,
  },
} satisfies Record<string, View>;
