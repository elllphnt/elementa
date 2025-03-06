import { ControlEntry, SelectControl } from "@repo/components";
import { useObservable } from "@repo/utils";
import { useElllProject } from "../../../hooks/project/project";
import { ElllTheme } from "../../../libs/project/themes/theme";

export function ThemeSettingsView({
  theme,
}: {
  theme: ElllTheme;
}): JSX.Element {
  const project = useElllProject();
  const themes = useObservable(
    project.themeStore.themes$,
    project.themeStore.themes,
  );
  const otherThemes = themes.filter((t) => t.id !== theme.id);

  return (
    <div
      className="el-h-full el-w-full el-space-y-3"
      style={{
        width: 320,
      }}
    >
      <ControlEntry label="Base">
        <SelectControl
          value={theme.base}
          value$={theme.base$}
          onChange={(value) => {
            if (value) {
              theme.setBase(value);
            }
          }}
          settings={{
            options: otherThemes.map((t) => ({
              value: t.url,
              label: t.name,
            })),
          }}
        />
      </ControlEntry>
    </div>
  );
}
