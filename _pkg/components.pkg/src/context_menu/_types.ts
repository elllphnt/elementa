export type ContextMenuOption = {
  label: string;
  icon?: string | React.ReactNode;
} & (
  | {
      action: () => void;
    }
  | {
      submenu: ContextMenuOption[][];
    }
);

export type ContextMenu = {
  key: number;
  position: {
    x: number;
    y: number;
  };
  options?: ContextMenuOption[][];
  viewId?: string;
};
