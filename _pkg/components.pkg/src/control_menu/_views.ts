import { View } from "../view/_types";
import { ControlMenuShell } from "./control_menu_shell";

export const controlMenuViews = {
  shell: {
    id: "elll.shell.menu-modal-shell",
    render: ControlMenuShell,
  },
} satisfies Record<string, View>;
