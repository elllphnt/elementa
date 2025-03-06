import { BaseControlType, Control, FullControlEntry } from "@repo/components";
import { useObservable } from "@repo/utils";
import { map } from "rxjs";
import { useElllProject } from "../../../../hooks/project/project";

export function ProjectThemesSheet(): JSX.Element {
  const project = useElllProject();
  const themes = useObservable(
    project.themeStore.themes$,
    project.themeStore.themes,
  );

  return (
    <>
      <FullControlEntry label="Default">
        <Control
          type={BaseControlType.Select}
          value$={project
            .mappedTheme$("default")
            .pipe(map((theme) => theme?.url))}
          value={project.mappedTheme("default")?.url}
          onChange={(value) =>
            project.setMappedTheme("default", value as string)
          }
          settings={{
            options: [
              {
                value: undefined,
                label: "None",
              },
              ...themes.map((theme) => ({
                value: theme.url,
                label: theme.name,
              })),
            ],
          }}
        />
      </FullControlEntry>
      <FullControlEntry label="Dark">
        <Control
          type={BaseControlType.Select}
          value$={project.mappedTheme$("dark").pipe(map((theme) => theme?.url))}
          value={project.mappedTheme("dark")?.url}
          onChange={(value) => project.setMappedTheme("dark", value as string)}
          settings={{
            options: [
              {
                value: undefined,
                label: "None",
              },
              ...themes.map((theme) => ({
                value: theme.url,
                label: theme.name,
              })),
            ],
          }}
        />
      </FullControlEntry>
    </>
  );
}
