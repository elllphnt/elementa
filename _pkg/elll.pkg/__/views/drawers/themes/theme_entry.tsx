import { elllIcons16, Icon, TreeEntry, useControlMenu } from "@repo/components";
import { useObservable } from "@repo/utils";
import { useElllProject } from "../../../hooks/project/project";
import { ElllTheme } from "../../../libs/project/themes/theme";
import { modalViews } from "../../modals/_";

export function ThemeEntry({ theme }: { theme: ElllTheme }) {
  const project = useElllProject();
  const defaultTheme = useObservable(
    project.mappedTheme$("default"),
    project.mappedTheme("default"),
  );
  const darkTheme = useObservable(
    project.mappedTheme$("dark"),
    project.mappedTheme("dark"),
  );

  const name = useObservable(theme.name$, theme.name);
  const { openMenu } = useControlMenu();

  const isDefault = theme === defaultTheme;
  const isDark = theme === darkTheme;

  const suffixes: React.ReactNode[] = [];

  if (isDefault) {
    suffixes.push(
      <div key="light" className="el-text-sm el-text-fg-400">
        default
      </div>,
    );
  }
  if (isDark) {
    suffixes.push(
      <div key="dark" className="el-text-sm el-text-fg-400">
        dark
      </div>,
    );
  }

  return (
    <TreeEntry
      onClick={(e) => {
        openMenu({
          anchor: e.currentTarget,
          title: "Theme",
          viewId: modalViews.theme.id,
          props: { theme },
        });
      }}
      icon={<Icon name={elllIcons16.variable} />}
      suffix={<div className="el-flex el-gap-1">{suffixes}</div>}
    >
      {name}
    </TreeEntry>
  );
}
