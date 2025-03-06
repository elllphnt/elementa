import {
  elllIcons16,
  Icon,
  mixed,
  resolveCommonValue,
  ScrollArea,
  TreeEntry,
  TreeIndent,
  useControlMenu,
} from "@repo/components";
import { FragmentEnvironment, StateInstance } from "@repo/elementa";
import {
  ElementaInteractor,
  ElementHandle,
  FrameWidgetHandle,
} from "@repo/elementa-interactor";
import { State, ValueState } from "@repo/elementa-models";
import { useShell } from "@repo/shell";
import { useManyObservables, useObservable } from "@repo/utils";
import { useEffect, useRef, useState } from "react";
import { map, Observable, of } from "rxjs";
import { useWorkspaceState } from "~/src/hooks/shell/workspace";
import { keys } from "~/src/libs/keys";

function useActiveEnvironment({
  interactor,
}: {
  interactor: ElementaInteractor;
}) {
  const selection = useObservable(
    interactor.interactionManager.selection$,
    interactor.interactionManager.selection,
  );
  const environments$ = selection
    .map((handle) => {
      if (handle instanceof ElementHandle) {
        return of(handle.instance.environment);
      }
      if (handle instanceof FrameWidgetHandle) {
        return handle.instance.fragment$.pipe(
          map((fragment) => fragment?.environment),
        );
      }
    })
    .filter(Boolean) as Observable<FragmentEnvironment | undefined>[];
  const environments = useManyObservables(
    environments$,
    [] as (FragmentEnvironment | undefined)[],
    selection.map((h) => h.key).join(","),
  );
  const environment = resolveCommonValue(environments);

  if (environment !== mixed && environment) {
    return environment;
  } else {
    return undefined;
  }
}

function arrayToObjectPropertyAccess(arr: string[]): string {
  // Regular expression to check if a string is a valid identifier
  const validIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

  // Start with an empty access string
  let accessString = "";

  arr.forEach((str, index) => {
    // Check if the string is a valid identifier
    if (validIdentifier.test(str)) {
      // If it's the first element, don't prepend with a dot
      if (index === 0) {
        accessString += str;
      } else {
        accessString += "." + str;
      }
    } else {
      // If it's not a valid identifier, use bracket notation
      accessString += `['${str}']`;
    }
  });

  return accessString;
}

function stringifyValue(value: any): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object") {
    return `{${Object.keys(value).join(", ")}}`;
  }
  return String(value);
}

function StateEntryLine({
  state,
  onRemove,
  container,
  open,
  onToggleOpen,
  value,
  isNew,
  clearNew,
}: {
  state: StateInstance;
  onRemove: () => void;
  container?: boolean;
  open?: boolean;
  onToggleOpen?: (open: boolean) => void;
  value?: string;
  isNew?: boolean;
  clearNew?: () => void;
}): JSX.Element {
  const { openMenu } = useControlMenu();
  const name = useObservable(state.entity.name$, state.entity.name);
  const [renaming, setRenaming] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNew) {
      setRenaming(true);
    }
  }, [isNew]);

  function openStateMenu() {
    openMenu({
      title: "State",
      anchor: ref.current ?? undefined,
      viewId: keys.views.modals.state,
      props: {
        state,
      },
    });
  }

  return (
    <TreeEntry
      nested
      ref={ref}
      container={container}
      icon={<Icon name={elllIcons16.model} color="#0f8" />}
      open={open}
      onToggleOpen={onToggleOpen}
      onDoubleClick={() => setRenaming(true)}
      actions={[
        {
          icon: <Icon name={elllIcons16.cross} />,
          handler: onRemove,
        },
      ]}
      onClick={(e) => {
        e.stopPropagation();
        openStateMenu();
      }}
    >
      {renaming ? (
        <input
          type="text"
          value={name}
          onChange={(e) => state.entity.setName(e.target.value)}
          onBlur={(e) => {
            setRenaming(false);
            if (isNew) {
              clearNew?.();
              openStateMenu();
            }
          }}
          autoFocus
          style={{
            background: "none",
            outline: "none",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
        />
      ) : (
        <>
          {name}
          {value ? (
            <span
              className="el-text-fg-500"
              style={{
                fontFamily: "monospace",
              }}
            >
              : {value}
            </span>
          ) : null}
        </>
      )}
    </TreeEntry>
  );
}

export function ObjectEntry({
  path,
  name,
  value,
  stateKey,
}: {
  path: string[];
  name: string;
  value: any;
  stateKey: string[];
}) {
  const shell = useShell();
  const [open, setOpen] = useWorkspaceState([...stateKey, "open"], false);
  const [hover, setHover] = useState(false);

  const isContainer = typeof value === "object" && value !== null;
  let icon = elllIcons16.model;
  let color = "#0f8";

  switch (typeof value) {
    case "string":
      icon = elllIcons16.text;
      color = "#f80";
      break;
    case "number":
      icon = elllIcons16.size;
      color = "#08f";
      break;
    case "boolean":
      icon = elllIcons16.range;
      color = "#f08";
      break;
    case "object":
      if (value === null) {
        icon = elllIcons16.container;
        color = "#888";
      }
      break;
    case "function":
      icon = elllIcons16.direction;
      color = "#8f0";
  }

  return (
    <div className="el-space-y-1">
      <TreeEntry
        icon={<Icon name={icon} color={color} />}
        nested
        container={isContainer}
        open={open}
        onToggleOpen={setOpen}
        size="small"
        suffix={
          hover ? (
            <Icon
              className="el-h-4 el-w-4 hover:el-opacity-100 el-opacity-50"
              name={elllIcons16.loader}
              onClick={() => {
                // copy path to clipboard
                const pathString = arrayToObjectPropertyAccess(path);
                navigator.clipboard.writeText(pathString);
                shell.toast({
                  message: `Identifier copied to clipboard: ${pathString}`,
                });
              }}
            />
          ) : (
            <></>
          )
        }
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {name}
        <span
          className="el-text-fg-500"
          style={{
            fontFamily: "monospace",
          }}
        >
          : {stringifyValue(value)}
        </span>
      </TreeEntry>
      {isContainer && open ? (
        <TreeIndent>
          <div className="el-space-y-1">
            {Object.entries(value).map(([key, value]) => (
              <ObjectEntry
                key={key}
                name={key}
                value={value}
                stateKey={[...stateKey, key]}
                path={[...path, key]}
              />
            ))}
          </div>
        </TreeIndent>
      ) : (
        <></>
      )}
    </div>
  );
}

export function StateOutline({
  state,
  onRemove,
  interactor,
  stateKey,
  isNew,
  clearNew,
}: {
  state: StateInstance;
  onRemove: () => void;
  interactor: ElementaInteractor;
  stateKey: string[];
  isNew?: boolean;
  clearNew?: () => void;
}): JSX.Element {
  const environment = useActiveEnvironment({ interactor });
  const [open, setOpen] = useWorkspaceState([...stateKey, "open"], false);
  const name = useObservable(state.entity.name$, state.entity.name);
  const namespace = useObservable(
    environment?.namespace$,
    environment?.namespace,
  );
  const value = namespace?.get(state.namespaceKey);

  const isContainer = typeof value === "object" && value !== null;

  console.log("StateOutline environment", { environment, state });

  return (
    <div className="el-space-y-1">
      <StateEntryLine
        container={isContainer}
        state={state}
        onRemove={onRemove}
        open={open}
        onToggleOpen={setOpen}
        value={namespace && !open ? stringifyValue(value) : undefined}
        isNew={isNew}
        clearNew={clearNew}
      />

      {isContainer && open ? (
        <TreeIndent>
          <div className="el-space-y-1">
            {Object.entries(value).map(([key, value]) => (
              <ObjectEntry
                key={key}
                name={key}
                value={value}
                stateKey={[...stateKey, key]}
                path={[name ?? "", key]}
              />
            ))}
          </div>
        </TreeIndent>
      ) : (
        <></>
      )}
    </div>
  );
}

export function StatesOutline({
  interactor,
  stateKey,
}: {
  interactor: ElementaInteractor;
  stateKey: string[];
}): JSX.Element {
  const states = useObservable(
    interactor.stager.elementa.states$,
    interactor.stager.elementa.states,
  );
  const component = useObservable(
    interactor.stager.elementa.component$,
    interactor.stager.elementa.component,
  );
  const [newState, setNewState] = useState<State | undefined>();

  return (
    <ScrollArea scrollY containerClassName="el-px-2 el-pb-2 el-space-y-1">
      {states?.map((state) => (
        <StateOutline
          key={state.id}
          state={state}
          onRemove={() => component?.removeState(state.entity)}
          interactor={interactor}
          stateKey={[...stateKey, state.id]}
          isNew={state.entity === newState}
          clearNew={() => setNewState(undefined)}
        />
      ))}

      <TreeEntry
        icon={<Icon name={elllIcons16.plus} />}
        onClick={() => {
          if (!component) {
            return;
          }
          const state = new ValueState({ component });
          component.addState(state);
          setNewState(state);
        }}
      >
        Add State
      </TreeEntry>
    </ScrollArea>
  );
}
