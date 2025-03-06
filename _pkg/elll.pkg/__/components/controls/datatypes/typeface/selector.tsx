import {
  ControlProps,
  elllIcons16,
  Icon,
  ScrollArea,
  TreeEntry,
  useControlMenu,
} from "@repo/components";
import { Typeface } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import cx from "classnames";
import { useEffect, useState } from "react";
import { Observable } from "rxjs";
import {
  useElllProject,
  useProjectTypefaces,
} from "../../../../hooks/project/project";
import { Webfont } from "../../../../libs/fonts/webfont";
import { fontVariantName, sortVariants } from "../../../../libs/typeface";
import { typefaceControlViews } from "./_views";

function TypeFaceEntry({
  active,
  typeface,
  onVariant,
  activeVariant,
}: {
  active: boolean;
  typeface: Typeface;
  onVariant: (variant: string) => void;
  activeVariant?: string;
}): JSX.Element {
  const project = useElllProject();
  const definition = useObservable(typeface.definition$, typeface.definition);
  const variants = useObservable(typeface.variants$, typeface.variants);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (definition?.family) {
      Webfont?.then((w) => {
        w.load({
          classes: false,
          google: {
            families: [definition.family + ":400"],
            text: definition.family,
          },
        });
      });
    }
  }, [definition?.family]);

  return (
    <div
      className={cx(
        "el-px-3 el-py-2 el-cursor-pointer el-rounded el-space-y-1",
        {
          "el-bg-fg/5": active,
        },
      )}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="el-flex el-items-center el-h-7">
        <div
          className="el-grow"
          style={{
            fontFamily: definition?.family,
            fontSize: "16px",
            lineHeight: "120%",
          }}
        >
          {definition?.family}
        </div>
      </div>
      {variants.sort(sortVariants).map((variant) => (
        <TreeEntry
          icon={<Icon name={elllIcons16.font} />}
          key={variant}
          actions={[
            {
              icon: <Icon name={elllIcons16.cross} />,
              handler: () => {
                project.typefaceManager.uninstallFonts(typeface.id, [variant]);
              },
            },
          ]}
          active={activeVariant === variant}
          onClick={() => {
            onVariant(variant);
          }}
        >
          {fontVariantName(variant)}
        </TreeEntry>
      ))}
    </div>
  );
}

export function TypefaceSelector({
  value$,
  value,
  onChange,
  settings = {},
}: ControlProps<
  | string
  | {
      variantValue?: string;
      variantValue$?: Observable<string>;
      setVariantValue?: (value: string) => void;
    }
>) {
  const currentValue = useObservable(value$, value);
  const currentVariantValue = useObservable(
    settings.variantValue$,
    settings.variantValue,
  );
  const { openMenu } = useControlMenu();
  const typefaces = useProjectTypefaces();

  let content = <></>;

  if (!typefaces.length) {
    content = (
      <div
        className="el-w-full el-flex el-flex-col el-items-center el-justify-center el-text-center el-space-y-4 el-p-4"
        style={{
          aspectRatio: "2/1",
        }}
      >
        <div className="el-text-fg-300">
          This project does not have any installed typefaces.
        </div>
        <button
          className="el-text-fg-400 hover:el-text-fg-500"
          onClick={() => {
            openMenu({
              title: "Browse Typefaces",
              viewId: typefaceControlViews.browser.id,
              props: {
                type: "typeface",
              },
            });
          }}
        >
          Add typeface
        </button>
      </div>
    );
  } else {
    content = (
      <div className="el-h-full el-w-full el-flex el-flex-col el-gap-2">
        <div className="el-grow el-overflow-hidden">
          <ScrollArea scrollY containerClassName="el-space-y-2">
            {typefaces.map((typeface) => (
              <TypeFaceEntry
                key={typeface.id}
                active={typeface.id === currentValue}
                typeface={typeface}
                activeVariant={
                  typeface.id === currentValue ? currentVariantValue : undefined
                }
                onVariant={(variant) => {
                  onChange?.(typeface.id);
                  if (variant) {
                    settings.setVariantValue?.(variant);
                  }
                }}
              />
            ))}
          </ScrollArea>
        </div>

        <hr />

        <button
          className="el-shrink-0 el-h-7 el-rounded hover:el-bg-fg/5 el-px-3 el-text-fg-400 hover:el-text-fg-500"
          onClick={() => {
            openMenu({
              title: "Browse Typefaces",
              viewId: typefaceControlViews.browser.id,
            });
          }}
        >
          Manage typefaces
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        height: 320,
        width: 280,
      }}
    >
      {content}
    </div>
  );
}
