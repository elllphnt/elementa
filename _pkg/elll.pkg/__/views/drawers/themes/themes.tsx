import { elllIcons16, ScrollArea, useAction } from "@repo/components";
import { useObservable } from "@repo/utils";
import { useCallback, useState } from "react";
import { useElllProject } from "../../../hooks/project/project";
import { NewThemeEntry } from "./new_theme_entry";
import { ThemeEntry } from "./theme_entry";

export function ThemesView(): JSX.Element {
  const project = useElllProject();
  const themes = useObservable(
    project.themeStore.themes$,
    project.themeStore.themes,
  );

  const [addingTheme, setAddingTheme] = useState(false);

  useAction(
    {
      title: "Add Theme",
      icon: elllIcons16.plus,
      handler: () => {
        setAddingTheme(true);
      },
    },
    [],
  );

  const handleNewTheme = useCallback(async (name: string) => {
    setAddingTheme(false);
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    await project.themeStore.createTheme(name);
  }, []);

  return (
    <ScrollArea
      scrollY
      containerClassName="el-p-2 el-pt-1 el-gap-1 el-flex el-flex-col"
    >
      {addingTheme ? <NewThemeEntry onCompleted={handleNewTheme} /> : <></>}
      {themes?.map((theme) => <ThemeEntry key={theme.id} theme={theme} />)}
    </ScrollArea>
  );
}
