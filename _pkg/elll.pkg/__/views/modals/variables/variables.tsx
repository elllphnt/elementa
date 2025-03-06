import {
  elllIcons16,
  Icon,
  ScrollArea,
  SelectControl,
  StatefulInput,
  TextControl,
} from "@repo/components";
import { Variable } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import cx from "classnames";
import { useRef, useState } from "react";
import {
  DragDropContext,
  Draggable,
  DraggingStyle,
  Droppable,
  DropResult,
  ResponderProvided,
} from "react-beautiful-dnd";
import { useElllProject } from "../../../hooks/project/project";
import { useWorkspaceState } from "../../../hooks/shell/workspace";
import { VariableGroup } from "../../../libs/project/variables/variable_group";
import { ElllVariableStore } from "../../../libs/project/variables/variable_store";

function getClosetPositionParent(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    if (style.position !== "static" && style.position !== "relative") {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

function VariableEntry({
  variable,
  onRemove,
  index,
}: {
  variable: Variable;
  onRemove?: () => void;
  index: number;
}): JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null);

  return (
    <Draggable draggableId={variable.id} index={index}>
      {(provided, snapshot) => {
        let top: undefined | number;
        let left: undefined | number;

        if (snapshot.isDragging) {
          const root = ref.current
            ? getClosetPositionParent(ref.current)
            : null;
          const rootRect = root ? root.getBoundingClientRect() : null;
          const rootX = rootRect ? rootRect.x : 0;
          const rootY = rootRect ? rootRect.y : 0;
          const style = provided.draggableProps.style as DraggingStyle;
          top = style.top - rootY;
          left = style.left - rootX;
        } else {
          top = undefined;

          left = undefined;
        }

        return (
          <div
            ref={(el) => {
              ref.current = el;
              provided.innerRef(el);
            }}
            {...provided.draggableProps}
            style={{
              ...provided.draggableProps.style,
              top,
              left,
            }}
            className={cx(
              "el-flex el-gap-2 el-p-1 el-pr-2 el-border el-border-transparent el-items-center",
              {
                "el-bg-bg el-rounded-lg": snapshot.isDragging,
              },
            )}
          >
            <div
              {...provided.dragHandleProps}
              className="el-h-7 el-w-7 el-shrink-0 el-flex el-items-center el-justify-center"
            >
              <Icon className="el-h-4 el-w-4" />
            </div>
            <TextControl
              value$={variable.name$}
              value={variable.name}
              onChange={(value) => {
                variable.setName(value);
              }}
            />
            <SelectControl
              value$={variable.datatype$}
              value={variable.datatype}
              onChange={(value) => {
                variable.setDatatype(value);
              }}
              settings={{
                options: [
                  { value: "angle", label: "Angle" },
                  { value: "boolean", label: "Boolean" },
                  { value: "color", label: "Color" },
                  { value: "duration", label: "Duration" },
                  { value: "length", label: "Length" },
                  { value: "number", label: "Number" },
                  { value: "string", label: "String" },
                ],
              }}
            />
            <button className="el-h-5 el-w-5 el-shrink-0 el-flex el-items-center el-justify-center hover:el-bg-fg/5 el-rounded">
              <Icon
                className="el-h-4 el-w-4"
                name={elllIcons16.minus}
                onClick={onRemove}
              />
            </button>
          </div>
        );
      }}
    </Draggable>
  );
}
function AddVariableEntry({ group }: { group: VariableGroup }): JSX.Element {
  const [name, setName] = useState("");

  return (
    <div
      className={cx("el-flex el-gap-2 el-p-1 el-border el-border-transparent")}
    >
      <div className="el-h-7 el-w-7 el-shrink-0 el-flex el-items-center el-justify-center"></div>
      <TextControl
        value={name}
        onChange={(value) => {
          setName(value ?? "");
        }}
        settings={{
          autofocus: true,
          placeholder: "New Variable",
          onBlur: () => {
            if (name) {
              const variable = new Variable({ project: group.store.project });
              variable.setName(name);
              variable.setDatatype("string");
              group.store.addVariable(variable);
              group.addVariable(variable);
              setName("");
            }
          },
        }}
      />
    </div>
  );
}
function AddGroupEntry({ store }: { store: ElllVariableStore }): JSX.Element {
  const [name, setName] = useState("");

  return (
    <div className={cx("el-flex")}>
      <TextControl
        value={name}
        onChange={(value) => {
          setName(value ?? "");
        }}
        settings={{
          placeholder: "New Group",
          onBlur: () => {
            if (name) {
              const group = new VariableGroup({ store });
              group.setName(name);
              store.addGroup(group);
              setName("");
            }
          },
        }}
      />
    </div>
  );
}

function VariableEntryGroup({ group }: { group: VariableGroup }): JSX.Element {
  const name = useObservable(group.name$, group.name);
  const variables = useObservable(group.variables$, group.variables);
  const [open, setOpen] = useWorkspaceState(
    ["modals", "variables", group.id, "open"],
    true,
  );

  return (
    <div className="el-space-y-2">
      <div className="el-p-1 el-flex el-items-center el-gap-2 el-h-7 el-rounded hover:el-bg-bg-100 el-cursor-pointer">
        <button className="el-rounded hover:el-bg-fg/5 el-w-5 el-h-5 el-flex el-items-center el-justify-center">
          <Icon
            className={cx("el-shrink-0 el-w-4 el-h-4", {
              "el-rotate-90": open,
            })}
            name={elllIcons16.chevron}
            onClick={() => {
              setOpen(!open);
            }}
          />
        </button>

        {group.id === "__default" ? (
          <div className="el-grow el-font-semibold">{name}</div>
        ) : (
          <div
            className="el-grow"
            onClick={() => {
              setOpen(!open);
            }}
          >
            <StatefulInput
              value={name}
              placeholder="Untitled Group"
              onChange={(e) => {
                group.setName(e.currentTarget.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
              style={{
                outline: "none",
                border: "none",
              }}
              className="el-font-semibold"
              size={name?.length ?? "Untitled Group".length}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          </div>
        )}

        <div className="el-shrink-0 el-rounded hover:el-bg-fg/5 el-w-5 el-h-5 el-flex el-items-center el-justify-center">
          {group.id !== "__default" ? (
            <button>
              <Icon
                className="el-w-4 el-h-4"
                name={elllIcons16.minus}
                onClick={() => {
                  group.store.removeGroup(group);
                }}
              />
            </button>
          ) : (
            <></>
          )}
        </div>
      </div>

      {open ? (
        <div>
          <Droppable droppableId={group.id}>
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={cx("-el-mx-1")}
              >
                {variables.map((variable, index) => (
                  <VariableEntry
                    key={variable.id}
                    variable={variable}
                    index={index}
                    onRemove={() => {
                      group.store.removeVariable(variable);
                      group.removeVariable(variable);
                    }}
                  />
                ))}
                {provided.placeholder}
                <AddVariableEntry group={group} />
              </div>
            )}
          </Droppable>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export function ProjectVariablesView(): JSX.Element {
  const project = useElllProject();
  const groups = useObservable(
    project.variableStore.groups$,
    project.variableStore.groups,
  );
  const defaultGroupSize = useObservable(
    project.variableStore.defaultGroup.size$,
    project.variableStore.defaultGroup.size,
  );

  function handleDragEnd(result: DropResult, provided: ResponderProvided) {
    if (!result.destination) {
      return;
    }

    const source =
      project.variableStore.group(result.source.droppableId) ||
      project.variableStore.defaultGroup;
    const destination =
      project.variableStore.group(result.destination.droppableId) ||
      project.variableStore.defaultGroup;

    if (source && destination) {
      if (source === destination) {
        const newVariableIds = [...source.variableIds];
        newVariableIds.splice(result.source.index, 1);
        newVariableIds.splice(result.destination.index, 0, result.draggableId);
        source.setVariableIds(newVariableIds);
      } else {
        const newSourceVariableIds = [...source.variableIds];
        newSourceVariableIds.splice(result.source.index, 1);
        const newDestinationVariableIds = [...destination.variableIds];
        newDestinationVariableIds.splice(
          result.destination.index,
          0,
          result.draggableId,
        );

        source.setVariableIds(newSourceVariableIds);
        destination.setVariableIds(newDestinationVariableIds);
      }
    } else {
      alert("Error: source or destination not found");
    }
  }

  return (
    <div
      style={{
        height: 600,
        minWidth: 320,
      }}
      className="el-space-y-3 el-pt-1"
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="el-w-full el-h-full el-flex el-flex-col el-gap-2">
          <AddGroupEntry store={project.variableStore} />
          <div className="el-grow el-overflow-hidden">
            <ScrollArea scrollY containerClassName="el-space-y-3">
              {groups.map((group) => (
                <VariableEntryGroup key={group.id} group={group} />
              ))}
              {defaultGroupSize ? (
                <VariableEntryGroup
                  group={project.variableStore.defaultGroup}
                />
              ) : (
                <></>
              )}
            </ScrollArea>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
