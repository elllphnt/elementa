import {
  baseSelector,
  entityTypeMatch,
  entityTypes,
} from "@elllphnt/elll-element";
import {
  elllIcons16,
  Icon,
  IconButton,
  ScrollArea,
  TreeEntry,
} from "@repo/components";
import { Stylesheet } from "@repo/elementa-models";
import { useManyObservables, useObservable } from "@repo/utils";
import cx from "classnames";
import _ from "lodash";
import { useRef, useState } from "react";
import { StyleEditor } from "~/src/components/style_editor/style_editor";
import { ElementaEditorState } from "~/src/editors/elementa/editor";
import { resolveArrayIntersection, resolveCommon } from "~/src/libs/utils";
import {
  ElementHandle,
  EntityHandle,
  FrameWidgetHandle,
  PageElementHandle,
} from "../../../../../elementa-interactor.pkg/dist";

function AddStylePanel({
  stylesheets,
  setPanel,
}: {
  stylesheets: Stylesheet[];
  setPanel: (panel: string) => void;
}): JSX.Element {
  const [modifiers, setModifiers] = useState<string[]>([]);
  const selector = modifiers.sort().join(":");

  const addModifier = (modifier: string) => {
    setModifiers((prev) => {
      return _.uniq([...prev, modifier]);
    });
  };
  const removeModifier = (modifier: string) => {
    setModifiers((prev) => {
      return prev.filter((a) => a !== modifier);
    });
  };

  return (
    <div className="el-h-full el-w-full el-flex el-flex-col el-p-3 el-space-y-3">
      <div className="el-flex el-gap-2">
        <input
          type="text"
          className="el-w-full el-h-7 el-px-2 el-border el-rounded"
          placeholder="No modifier selected"
          value={selector}
          readOnly
        />
      </div>

      <div className="el-grow el-overflow-hidden">
        <ScrollArea scrollY>
          {Object.entries({}).map(([key, config]) => {
            const isSelected = modifiers.includes(key);
            return (
              <button
                key={key}
                className={cx(
                  "el-h-5 el-px-1.5 el-rounded el-mr-2 el-mb-2 el-cursor-pointer el-transition-colors",
                  {
                    "el-bg-fg/5 el-text-fg-400 hover:el-text-fg": !isSelected,
                    "el-bg-pm el-text-pm-ctr hover:el-bg-pm-400": isSelected,
                  },
                )}
                onClick={() => {
                  if (isSelected) {
                    removeModifier(key);
                  } else {
                    addModifier(key);
                  }
                }}
              >
                {key}
              </button>
            );
          })}
        </ScrollArea>
      </div>

      <div className="el-flex el-gap-2">
        <button
          className="el-w-1/2 el-h-6 el-rounded el-bg-fg/5 hover:el-bg-fg/10"
          onClick={() => setPanel("select")}
        >
          Cancel
        </button>
        <button
          className="el-w-1/2 el-h-6 el-rounded el-bg-fg/5 hover:el-bg-fg/10"
          onClick={() => {
            stylesheets.forEach((stylesheet) => {
              stylesheet.addStyle(selector);
              stylesheet.setActiveSelector(selector);
            });
            setPanel("select");
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
function SelectStylePanel({
  stylesheets,
  setPanel,
}: {
  stylesheets: Stylesheet[];
  setPanel: (panel: string) => void;
}): JSX.Element {
  const [search, setSearch] = useState("");
  const activeSelectors = useManyObservables(
    stylesheets.map((a) => a.activeSelector$),
    stylesheets.map((a) => a.activeSelector),
    stylesheets.map((a) => a.key).join(","),
  );
  const activeSelector = resolveCommon(activeSelectors);
  const setOfSelectors = useManyObservables(
    stylesheets.map((a) => a.selectors$),
    stylesheets.map((a) => a.selectors),
    stylesheets.map((a) => a.key).join(","),
  );
  const selectors = resolveArrayIntersection(setOfSelectors);
  const searchSelectors = selectors
    .filter((selector) => {
      return (
        selector !== baseSelector &&
        selector.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort();

  return (
    <div className="el-p-3 el-space-y-3">
      <div className="el-flex el-gap-2">
        <input
          type="text"
          className="el-w-full el-h-7 el-px-2 el-border el-rounded"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <IconButton
          className="el-h-7 el-w-7"
          icon={elllIcons16.plus}
          onClick={() => setPanel("add")}
        />
      </div>

      <div className="el-space-y-1">
        <TreeEntry
          noIcon
          active={activeSelector === baseSelector}
          onClick={() => {
            stylesheets.forEach((stylesheet) => {
              stylesheet.setActiveSelector(baseSelector);
            });
          }}
        >
          <span className="el-font-bold">Default Style</span>
        </TreeEntry>
        {searchSelectors.length ? (
          searchSelectors.map((selector) => {
            const isBase = selector === baseSelector;
            const isActive = activeSelector === selector;
            return (
              <TreeEntry
                key={selector}
                noIcon
                active={isActive}
                actions={[
                  {
                    icon: <Icon name={elllIcons16.cross} />,
                    handler: () => {
                      stylesheets.forEach((stylesheet) => {
                        stylesheet.removeStyle(selector);
                      });
                    },
                  },
                ]}
                onClick={() => {
                  stylesheets.forEach((stylesheet) => {
                    stylesheet.setActiveSelector(selector);
                  });
                }}
              >
                {isBase ? (
                  <span className="el-font-bold">Default Style</span>
                ) : (
                  selector
                )}
              </TreeEntry>
            );
          })
        ) : (
          <div className="el-px-2 el-text-sm el-text-fg-300">
            Click on the plus icon to add new styles.
          </div>
        )}
      </div>
    </div>
  );
}
function StyleSelectorPanel({
  stylesheets,
}: {
  stylesheets: Stylesheet[];
}): JSX.Element {
  const [panel, setPanel] = useState("select");

  switch (panel) {
    case "add":
      return <AddStylePanel stylesheets={stylesheets} setPanel={setPanel} />;
    case "select":
      return <SelectStylePanel stylesheets={stylesheets} setPanel={setPanel} />;
    default:
      return <></>;
  }
}
function StyleSelectorControl({
  styleModifiers,
  stylesheets,
  activeSelector,
}: {
  styleModifiers: string[];
  stylesheets: Stylesheet[];
  activeSelector: string;
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const modifiersDisplay = styleModifiers.join(":");
  const activeSelectorDisplay =
    activeSelector === baseSelector ? (
      <span className="el-opacity-50">Default Style</span>
    ) : (
      activeSelector
    );

  return (
    <div
      ref={ref}
      className="el-relative el-w-full el-py-2 el-px-3 el-text-fg-400 el-space-y-1"
    >
      <div className="el-text-sm">
        {modifiersDisplay ? (
          <span className="el-bg-pm el-text-pm-ctr el-px-1 el-rounded-sm">
            {modifiersDisplay}
          </span>
        ) : (
          <span className="el-bg-fg/10 el-px-1 el-rounded-sm el-italic">
            base
          </span>
        )}
      </div>
      <div
        className={cx(
          "el-flex el-cursor-pointer el-transition-colors hover:el-text-fg el-items-center",
          {
            "el-text-fg": open,
          },
        )}
        onClick={() => setOpen(!open)}
      >
        <div className="el-grow">{activeSelectorDisplay}</div>
        <Icon
          name={elllIcons16.chevron}
          className={cx("el-transition-transform", {
            "el-rotate-90": !open,
            "-el-rotate-90": open,
          })}
        />
      </div>

      <div
        className="el-bg-bg el-border-b el-transition-all el-shadow-md"
        style={{
          position: "absolute",
          bottom: -1,
          left: 0,
          right: 0,
          transform: "translateY(100%)",
          height: open ? 200 : 0,
          visibility: open ? "visible" : "hidden",
          zIndex: 1,
        }}
      >
        {open ? <StyleSelectorPanel stylesheets={stylesheets} /> : <></>}
      </div>
    </div>
  );
}

function ElementStylesheetPanel({
  elements,
}: {
  elements: ElementHandle[];
}): JSX.Element {
  const stylesheets = elements.map((handle) => handle.entity.stylesheet);
  const styleModifierSets = useManyObservables(
    elements.map((e) => e.instance.environment.styleModifiers$),
    elements.map((e) => e.instance.environment.styleModifiers),
    elements.map((e) => e.key).join(","),
  );
  const activeSelectors = useManyObservables(
    stylesheets.map((a) => a.activeSelector$),
    stylesheets.map((a) => a.activeSelector),
    stylesheets.map((a) => a.key).join(","),
  );
  const activeSelector = resolveCommon(activeSelectors) ?? baseSelector;
  const styleModifiers = resolveArrayIntersection(styleModifierSets);

  const styles = useManyObservables(
    stylesheets.map((a) => a.style$(activeSelector, true)),
    stylesheets.map((a) => a.style(activeSelector, true)),
    stylesheets.map((a) => a.key).join(",") + activeSelector,
  );

  return (
    <div className="el-h-full el-w-full el-flex el-flex-col">
      <div className="el-bg-bg-100 el-border-b">
        <StyleSelectorControl
          styleModifiers={styleModifiers}
          stylesheets={stylesheets}
          activeSelector={activeSelector}
        />
      </div>
      <div className="el-grow el-overflow-hidden">
        <ScrollArea scrollY noHandle>
          <StyleEditor
            key={styles.map((a) => a.key).join(",")}
            styles={styles}
          />
        </ScrollArea>
      </div>
    </div>
  );
}
function FramePageStylesheetPanel({
  frames,
}: {
  frames: FrameWidgetHandle[];
}): JSX.Element {
  const fragments = useManyObservables(
    frames.map((f) => f.fragment$),
    frames.map((f) => f.fragment),
    frames.map((f) => f.key).join(","),
  );
  const pages = useManyObservables(
    fragments.map((f) => f?.page$),
    fragments.map((f) => f?.page),
    fragments.map((f) => f?.key).join(","),
  ).filter(Boolean) as PageElementHandle[];

  return <ElementStylesheetPanel elements={pages} />;
}
function FrameStylesheetPanel({
  frames,
}: {
  frames: FrameWidgetHandle[];
}): JSX.Element {
  return <FramePageStylesheetPanel frames={frames} />;
}

function StylesheetPanelContent({
  editor,
}: {
  editor: ElementaEditorState;
}): JSX.Element {
  const interactor = useObservable(
    editor.elementaInteractor$,
    editor.elementaInteractor,
  );
  const selection =
    useObservable(
      interactor?.interactionManager.selection$,
      interactor?.interactionManager.selection,
    ) ?? [];

  if (
    selection.every(
      (handle) =>
        handle instanceof EntityHandle &&
        entityTypeMatch(handle.entity.type, entityTypes.element),
    )
  ) {
    return <ElementStylesheetPanel elements={selection as ElementHandle[]} />;
  } else if (
    selection.every(
      (handle) =>
        handle instanceof EntityHandle &&
        entityTypeMatch(handle.entity.type, entityTypes.widgets.frame),
    )
  ) {
    return <FrameStylesheetPanel frames={selection as FrameWidgetHandle[]} />;
  } else {
    return <></>;
  }
}

export function StylesheetPanel({
  editor,
}: {
  editor: ElementaEditorState;
}): JSX.Element {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        pointerEvents: "auto",
      }}
    >
      <StylesheetPanelContent editor={editor} />
    </div>
  );
}
