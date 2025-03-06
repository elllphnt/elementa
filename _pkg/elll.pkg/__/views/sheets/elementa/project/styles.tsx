import {
  ControlButton,
  elllIcons16,
  FullControlEntry,
  Icon,
  useControlMenu,
} from "@repo/components";
import { Stylesheet } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { useState } from "react";
import { useElllProject } from "../../../../hooks/project/project";
import { ElllStylesheet } from "../../../../libs/project/stylesheets/stylesheet";
import { modalViews } from "../../../modals/_";

function StylesheetSummary({ stylesheet }: { stylesheet: Stylesheet }) {
  const selectors = useObservable(stylesheet.selectors$, stylesheet.selectors);
  const count = selectors.length;
  let label = "No styles";

  if (count === 1) {
    label = "1 style";
  } else if (count > 1) {
    label = `${count} styles`;
  }

  return <span>{label}</span>;
}

function StylesheetControlEntry({
  mapKey,
  name,
}: {
  mapKey: string;
  name: string;
}) {
  const project = useElllProject();
  const stylesheet = useObservable(
    project.mappedStyleSheet$(mapKey),
    project.mappedStyleSheet(mapKey),
  );
  const { openMenu } = useControlMenu();
  const [loading, setLoading] = useState(false);

  return (
    <FullControlEntry label={name}>
      <ControlButton
        loading={loading}
        prefix={
          stylesheet ? (
            <Icon key="stylesheet" name={elllIcons16.stylesheet} />
          ) : (
            <Icon key="add" name={elllIcons16.plus} />
          )
        }
        label={
          stylesheet ? (
            <StylesheetSummary stylesheet={stylesheet.sheet} />
          ) : (
            "Add stylesheet"
          )
        }
        onClick={async () => {
          let sheet: Stylesheet;

          if (stylesheet) {
            sheet = stylesheet.sheet;
          } else {
            try {
              setLoading(true);
              const stylesheet =
                await project.stylesheetStore.createStylesheet(name);
              project.setMappedStyleSheet(mapKey, stylesheet.url);
              sheet = stylesheet.sheet;
            } finally {
              setLoading(false);
            }
          }

          openMenu({
            viewId: modalViews.stylesheetEditor.id,
            title: name,
            props: {
              stylesheets: [sheet],
            },
          });
        }}
        action={
          stylesheet
            ? {
                icon: elllIcons16.cross,
                label: "Delete",
                handler: async () => {
                  if (!stylesheet) return;

                  try {
                    setLoading(true);
                    await project.stylesheetStore.deleteStylesheet(
                      stylesheet as ElllStylesheet,
                    );
                    project.setMappedStyleSheet(mapKey, undefined);
                  } finally {
                    setLoading(false);
                  }
                },
              }
            : undefined
        }
      />
    </FullControlEntry>
  );
}

export function ProjectStylesSheet(): JSX.Element {
  return (
    <>
      <StylesheetControlEntry mapKey="root" name="Root" />
    </>
  );
}
