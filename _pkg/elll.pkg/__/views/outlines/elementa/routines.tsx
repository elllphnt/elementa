import {
  Icon,
  ScrollArea,
  TreeEntry,
  TreeIndent,
  elllIcons16,
  mixed,
  resolveCommonValue,
} from "@repo/components";
import {
  ControllerWidgetHandle,
  ElementHandle,
  ElementaEditor,
  Routine,
  RoutineInstance,
  entityTypeMatch,
  entityTypes,
  useElementaEditor,
} from "@repo/elementa";
import { FragmentEnvironment } from "@repo/elementa/dist/elementa/instances/fragment/environment";
import { useDrag, useShell } from "@repo/shell";
import { useObservable } from "@repo/utils";
import { useMemo, useState } from "react";
import { map } from "rxjs";
import { useWorkspaceState } from "../../../hooks/shell/workspace";
import { mimeTypes } from "../../../libs/constants/mime_types";
import { makeElementaUrl } from "../../../libs/elementa/uris";

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

function RoutineEntryLine({
  routine,
  onRemove,
  container,
  open,
  onToggleOpen,
  value,
}: {
  routine: Routine;
  onRemove: () => void;
  container?: boolean;
  open?: boolean;
  onToggleOpen?: (open: boolean) => void;
  value?: string;
}): JSX.Element {
  const editor = useElementaEditor();
  const selected$ = useMemo(() => {
    return editor.interactionManager.selection$.pipe(
      map((selection) => {
        return selection.some((handle) => {
          return (
            entityTypeMatch(
              handle.entity.type,
              entityTypes.widgets.controller,
            ) && (handle as ControllerWidgetHandle).entity.target === routine
          );
        });
      }),
    );
  }, []);
  const name = useObservable(routine.name$, routine.name);
  const [renaming, setRenaming] = useState(false);
  const selected = useObservable(selected$, false);

  const uri = makeElementaUrl({
    resourceId: routine.id,
    resourceType: "entity",
  });
  const [dragRef] = useDrag(
    {
      getData: () => ({
        [mimeTypes.uriList]: uri,
        [mimeTypes.text]: uri,
      }),
    },
    [routine],
  );

  return (
    <TreeEntry
      ref={dragRef}
      nested
      container={container}
      active={selected}
      icon={<Icon name={elllIcons16.routine} color="#0f8" />}
      open={open}
      onToggleOpen={onToggleOpen}
      onDoubleClick={() => setRenaming(true)}
      onClick={(e) => {
        const controllers = editor.handles.filter(
          (handle) =>
            entityTypeMatch(
              handle.entity.type,
              entityTypes.widgets.controller,
            ) && (handle as ControllerWidgetHandle).entity.target === routine,
        );
        editor.interactionManager.select([...controllers]);
      }}
    >
      {renaming ? (
        <input
          type="text"
          value={name}
          onChange={(e) => routine.setName(e.target.value)}
          onBlur={() => setRenaming(false)}
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

export function StaticRoutineOutline({
  routine,
  onRemove,
}: {
  routine: Routine;
  onRemove: () => void;
}): JSX.Element {
  return (
    <div className="el-space-y-1">
      <RoutineEntryLine routine={routine} onRemove={onRemove} />
    </div>
  );
}

function stringifyValue(value: any): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

export function ObjectEntry({
  path,
  name,
  value,
  routineKey,
}: {
  path: string[];
  name: string;
  value: any;
  routineKey: string[];
}) {
  const shell = useShell();
  const [open, setOpen] = useWorkspaceState([...routineKey, "open"], false);
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
                routineKey={[...routineKey, key]}
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

export function DynamicRoutineOutline({
  routine,
  onRemove,
  routineKey = [],
}: {
  routine: RoutineInstance;
  onRemove: () => void;
  routineKey: string[];
}): JSX.Element {
  const value = useObservable(routine.value$, routine.value);
  const [open, setOpen] = useWorkspaceState([...routineKey, "open"], false);
  const name = useObservable(routine.entity.name$, routine.entity.name);

  const isContainer = typeof value === "object" && value !== null;

  return (
    <div className="el-space-y-1">
      <RoutineEntryLine
        container={isContainer}
        routine={routine.entity}
        onRemove={onRemove}
        open={open}
        onToggleOpen={setOpen}
        value={stringifyValue(value)}
      />

      {isContainer && open ? (
        <TreeIndent>
          <div className="el-space-y-1">
            {Object.entries(value).map(([key, value]) => (
              <ObjectEntry
                key={key}
                name={key}
                value={value}
                routineKey={[...routineKey, key]}
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

export function EnvironmentalRoutineList({
  environment,
  routineKey = [],
}: {
  environment: FragmentEnvironment;
  routineKey: string[];
}): JSX.Element {
  const routines = useObservable(environment.routines$, environment.routines);

  if (!routines?.length) {
    return (
      <div
        className="el-text-fg el-space-y-4"
        style={{
          textAlign: "center",
          padding: 16,
        }}
      >
        <p>This component doesn't have any routines yet.</p>
        <p>
          Use the search bar above to find available routines in the current
          workspace.
        </p>
      </div>
    );
  }

  return (
    <div>
      {routines.map((routine) => (
        <DynamicRoutineOutline
          key={routine.key}
          routine={routine}
          onRemove={() =>
            routine.elementa.component?.removeRoutine(routine.entity)
          }
          routineKey={[...routineKey, routine.entity.id]}
        />
      ))}
    </div>
  );
}
export function StaticRoutineList({
  elementa,
}: {
  elementa: ElementaEditor;
}): JSX.Element {
  const component = useObservable(elementa.component$, elementa.component);
  const routines = useObservable(component?.routines$, component?.routines);

  if (!routines?.length) {
    return (
      <div
        className="el-text-fg el-space-y-4"
        style={{
          textAlign: "center",
          padding: 16,
        }}
      >
        <p>This component doesn't have any routines yet.</p>
        <p>
          Drag a routine file from the file explorer to the canvas to create a
          new routine.
        </p>
      </div>
    );
  }

  return (
    <div>
      {routines.map((routine) => (
        <StaticRoutineOutline
          key={routine.id}
          routine={routine}
          onRemove={() => component?.removeRoutine(routine)}
        />
      ))}
    </div>
  );
}
export function RoutineList({
  elementa,
  routineKey = [],
}: {
  elementa: ElementaEditor;
  routineKey: string[];
}): JSX.Element {
  const selection = useObservable(
    elementa.interactionManager.selection$,
    elementa.interactionManager.selection,
  );
  const selectedElements = selection.filter((s) =>
    entityTypeMatch(s.entity.type, entityTypes.element),
  ) as ElementHandle[];
  const elementEnvironments = selectedElements.map(
    (element) => element.instance.environment,
  );
  const environment = resolveCommonValue(elementEnvironments);

  if (environment !== mixed && environment) {
    return (
      <EnvironmentalRoutineList
        environment={environment}
        routineKey={routineKey}
      />
    );
  } else {
    return <StaticRoutineList elementa={elementa} />;
  }
}

export function RoutinesOutline({
  editor,
  routineKey = [],
}: {
  editor: ElementaEditor;
  routineKey: string[];
}): JSX.Element {
  return (
    <ScrollArea scrollY>
      <div
        style={{
          height: "100%",
          width: "100%",
        }}
        className="el-px-2 el-pb-2"
      >
        <RoutineList
          elementa={editor}
          routineKey={[...routineKey, "routines"]}
        />
      </div>
    </ScrollArea>
  );
}
