import {
  baseSelector,
  entityTypeMatch,
  entityTypes,
  parseModifier,
  StyleModifierDefinitionData,
  StyleModifierType,
} from "@elllphnt/elll-element";
import {
  elllIcons16,
  ExclusiveBox,
  Icon,
  IconButton,
  ScrollArea,
  TreeEntry,
} from "@repo/components";
import { useManyObservables, useObservable } from "@repo/utils";
import cx from "classnames";
import _ from "lodash";
import { useRef, useState } from "react";
import { StyleEditor } from "~/src/components/style_editor/style_editor";
import { ElementaEditorState } from "~/src/editors/elementa/editor";
import { useElllProject } from "~/src/hooks/project/project";
import { resolveArrayIntersection, resolveCommon } from "~/src/libs/utils";
import {
  ElementHandle,
  EntityHandle,
  FrameWidgetHandle,
  PageElementHandle,
} from "../../../../../elementa-interactor.pkg/dist";

function splitedSelector({
  selector,
  modifierDefinitions,
}: {
  selector: string;
  modifierDefinitions: Record<string, StyleModifierDefinitionData>;
}): [string, string] {
  if (!selector || selector === baseSelector) {
    return ["", ""];
  }
  const parts = selector.split(":");
  const contextParts: string[] = [];
  const elementParts: string[] = [];

  for (const part of parts) {
    const [modifier] = parseModifier({
      modifier: part,
      getModifierDefinition: (name) => modifierDefinitions[name],
      parseData: (_, data) => data,
    });
    if (!modifier) {
      elementParts.push(part);
      continue;
    }

    const definition = modifierDefinitions[modifier.name];
    if (definition?.type === StyleModifierType.Context) {
      contextParts.push(part);
    } else {
      elementParts.push(part);
    }
  }

  return [contextParts.join(":"), elementParts.join(":")];
}

function AddStylePanel({
  elements,
  contextSelector,
  setPanel,
}: {
  elements: ElementHandle[];
  contextSelector: string;
  setPanel: (panel: string) => void;
}): JSX.Element {
  const project = useElllProject();
  const modifierDefinitions = useObservable(
    project.styleManager.modifierSheet.modifiers$,
    project.styleManager.modifierSheet.modifiers,
  ).filter((m) => m.type === StyleModifierType.Element && !m.signature?.length);

  const [modifiers, setModifiers] = useState<string[]>([]);
  const elementSelector = modifiers.sort().join(":");

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
          value={elementSelector}
          readOnly
        />
      </div>

      <div className="el-grow el-overflow-hidden">
        <ScrollArea scrollY>
          {modifierDefinitions.map((modifier) => {
            const isSelected = modifiers.includes(modifier.name);
            return (
              <button
                key={modifier.id}
                className={cx(
                  "el-h-5 el-px-1.5 el-rounded el-mr-2 el-mb-2 el-cursor-pointer el-transition-colors",
                  {
                    "el-bg-fg/5 el-text-fg-400 hover:el-text-fg": !isSelected,
                    "el-bg-pm el-text-pm-ctr hover:el-bg-pm-400": isSelected,
                  },
                )}
                onClick={() => {
                  if (isSelected) {
                    removeModifier(modifier.name);
                  } else {
                    addModifier(modifier.name);
                  }
                }}
              >
                {modifier.name}
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
            const selector = [contextSelector, elementSelector]
              .filter(Boolean)
              .join(":");
            elements.forEach((element) => {
              element.entity.stylesheet.addStyle(selector);
              element.setActiveSelector(selector);
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
  contextSelector,
  elements,
  setPanel,
}: {
  contextSelector: string;
  elements: ElementHandle[];
  setPanel: (panel: string) => void;
}): JSX.Element {
  const project = useElllProject();
  const modifierDefinitions = useObservable(
    project.styleManager.modifiersByName$,
    project.styleManager.modifiersByName,
  );

  const [search, setSearch] = useState("");
  const activeSelectors = useManyObservables(
    elements.map((a) => a.activeSelector$),
    elements.map((a) => a.activeSelector),
    elements.map((a) => a.key).join(","),
  );
  const activeSelector = resolveCommon(activeSelectors);
  const setOfSelectors = useManyObservables(
    elements.map((a) => a.entity.stylesheet.selectors$),
    elements.map((a) => a.entity.stylesheet.selectors),
    elements.map((a) => a.key).join(","),
  );
  const selectors = resolveArrayIntersection(setOfSelectors).filter(
    (selector) => selector.startsWith(contextSelector),
  );
  const searchSelectors = selectors
    .sort()
    .map((selector) => splitedSelector({ selector, modifierDefinitions }))
    .filter((selector) => {
      return selector[0] === contextSelector && selector[1].includes(search);
    });

  return (
    <div className="el-h-full el-w-full el-flex el-flex-col">
      <div className="el-flex el-gap-2 el-p-3">
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
      <div className="el-grow el-overflow-hidden">
        <ScrollArea
          scrollY
          containerClassName="el-space-y-1 el-pl-3 el-pb-3 el-pr-4"
        >
          {searchSelectors.length ? (
            searchSelectors.map(([contextSelector, elementSelector]) => {
              const selector = [contextSelector, elementSelector]
                .filter(Boolean)
                .join(":");
              const isBase = elementSelector === "";
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
                        elements.forEach((element) => {
                          element.entity.stylesheet.removeStyle(selector);
                        });
                      },
                    },
                  ]}
                  onClick={() => {
                    elements.forEach((stylesheet) => {
                      stylesheet.setActiveSelector(selector);
                    });
                  }}
                >
                  {isBase ? (
                    <>
                      {contextSelector ? (
                        <span>{contextSelector}:</span>
                      ) : (
                        <></>
                      )}{" "}
                      <span className="el-italic el-opacity-50">default</span>
                    </>
                  ) : (
                    <>
                      {contextSelector ? (
                        <span>{contextSelector}:</span>
                      ) : (
                        <></>
                      )}
                      <span className="el-font-bold">{elementSelector}</span>
                    </>
                  )}
                </TreeEntry>
              );
            })
          ) : (
            <div className="el-px-2 el-text-sm el-text-fg-300">
              Click on the plus icon to add new styles.
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
function StyleSelectorPanel({
  contextSelector,
  elements,
}: {
  contextSelector: string;
  elements: ElementHandle[];
}): JSX.Element {
  const [panel, setPanel] = useState("select");

  switch (panel) {
    case "add":
      return (
        <AddStylePanel
          elements={elements}
          setPanel={setPanel}
          contextSelector={contextSelector}
        />
      );
    case "select":
      return (
        <SelectStylePanel
          elements={elements}
          setPanel={setPanel}
          contextSelector={contextSelector}
        />
      );
    default:
      return <></>;
  }
}
function ElementStyleSelectorControl({
  elements,
  activeSelector,
}: {
  elements: ElementHandle[];
  activeSelector: string;
}): JSX.Element {
  const project = useElllProject();
  const modifierDefinitions = useObservable(
    project.styleManager.modifiersByName$,
    project.styleManager.modifiersByName,
  );
  const [contextSelector, elementSelector] = splitedSelector({
    selector: activeSelector,
    modifierDefinitions,
  });
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <ExclusiveBox
      ref={ref}
      className="el-relative el-w-full el-py-2 el-px-3 el-text-fg-400 el-space-y-1"
      onClose={() => setOpen(false)}
    >
      <div className="el-text-sm">
        {contextSelector ? (
          <span className="el-bg-pm el-text-pm-ctr el-px-1 el-rounded-sm">
            {contextSelector}
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
        <div className="el-grow">
          {elementSelector ? (
            elementSelector
          ) : (
            <span className="el-opacity-50 el-italic">default</span>
          )}
        </div>
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
        {open ? (
          <StyleSelectorPanel
            elements={elements}
            contextSelector={contextSelector}
          />
        ) : (
          <></>
        )}
      </div>
    </ExclusiveBox>
  );
}

function ElementStylesheetPanel({
  elements,
}: {
  elements: ElementHandle[];
}): JSX.Element {
  const activeSelectors = useManyObservables(
    elements.map((a) => a.activeSelector$),
    elements.map((a) => a.activeSelector),
    elements.map((a) => a.key).join(","),
  );
  const activeSelector = resolveCommon(activeSelectors) || baseSelector;

  const stylesheets = elements.map((handle) => handle.entity.stylesheet);
  const styles = useManyObservables(
    stylesheets.map((a) => a.style$(activeSelector, true)),
    stylesheets.map((a) => a.style(activeSelector, true)),
    stylesheets.map((a) => a.key).join(",") + activeSelector,
  );

  return (
    <div className="el-h-full el-w-full el-flex el-flex-col">
      <div className="el-bg-bg-100 el-border-b">
        <ElementStyleSelectorControl
          elements={elements}
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
