import {
  ControlProps,
  elllIcons16,
  IconButton,
  ScrollArea,
  useControlValue,
} from "@repo/components";
import cx from "classnames";
import {
  MarkdownEditor,
  MarkdownEditorControl,
} from "~/src/components/libs/markdown_editor/markdown_editor";
import { useRepository } from "~/src/hooks/backend/repository";
import { useElllProject } from "~/src/hooks/project/project";
import { useWorkspaceState } from "~/src/hooks/shell/workspace";
import { UserGoalData } from "~/src/modules/elementa/project/brief/brief";

function NakedTextControl({
  value$,
  value,
  onChange,
  settings,
}: ControlProps<
  string,
  {
    placeholder?: string;
    className?: string;
  }
>) {
  const currentValue = useControlValue(value$, value) as string | undefined;
  return (
    <input
      type="text"
      placeholder={settings?.placeholder}
      value={currentValue}
      onChange={(e) => onChange?.(e.target.value)}
      className={cx("el-input el-font-semibold", settings?.className)}
    />
  );
}

export function UserGoalListItem({
  goal,
  onChange,
  onRemove,
  stateKey,
}: {
  goal: UserGoalData;
  onChange?: (goal: UserGoalData) => void;
  onRemove?: () => void;
  stateKey?: string[];
}) {
  const [open, setOpen] = useWorkspaceState(
    [...(stateKey || []), "open"],
    true,
  );

  return (
    <div className="el-group el-space-y-1 el-bg-bg-200/30 el-rounded">
      <div className="el-flex el-p-2 el-items-center el-gap-2">
        <IconButton
          icon={elllIcons16.chevron}
          iconClassName={cx("el-transition-transform", {
            "el-rotate-90": open,
            "el-rotate-0": !open,
          })}
          onClick={() => setOpen(!open)}
        />
        <input
          type="text"
          placeholder="Add a title"
          className="el-input el-text-lg el-font-semibold el-grow"
          value={goal.title}
          onChange={(e) => {
            onChange?.({
              ...goal,
              title: e.target.value,
            });
          }}
        />
        <div className="el-hidden group-hover:el-flex el-items-center el-gap-1 ">
          <IconButton
            icon={elllIcons16.trash}
            iconClassName="el-text-fg-400"
            onClick={onRemove}
          />
        </div>
      </div>
      {open ? (
        <div className="el-px-3 el-pb-2">
          <MarkdownEditor
            value={goal.description}
            onChange={(value) => {
              onChange?.({
                ...goal,
                description: value,
              });
            }}
            placeholder="Describe what you want to build."
          />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
export function UserGoalList() {
  const project = useElllProject();
  // const goals = useObservable(brief.goals$, brief.goals);
  // return (
  //   <div className="el-flex el-flex-col el-gap-2">
  //     {goals.map((goal, index) => (
  //       <UserGoalListItem
  //         key={index}
  //         goal={goal}
  //         onChange={(goal) => {
  //           brief.updateGoal(index, goal);
  //         }}
  //         onRemove={() => {
  //           brief.removeGoal(index);
  //         }}
  //         stateKey={[`user-goal-${index}`]}
  //       />
  //     ))}
  //     <button
  //       className="el-flex el-items-center el-gap-2 el-justify-center el-p-2 el-rounded el-bg-bg-200/30 el-text-fg-400 hover:el-bg-bg-200/50"
  //       onClick={() => {
  //         brief.setGoals([...brief.goals, { title: "", description: "" }]);
  //       }}
  //     >
  //       <Icon name={elllIcons16.plus} />
  //       <span className="el-text-fg-400">Add a user goal</span>
  //     </button>
  //   </div>
  // );
  return <>Goals list</>;
}

export function BriefEditor() {
  const repository = useRepository();
  const project = useElllProject();
  const brief = project.brief;

  return (
    <ScrollArea scrollY>
      <div className="el-flex el-flex-col el-gap-4 el-p-6">
        <div className="el-space-y-1">
          <NakedTextControl
            value$={repository?.name$}
            value={repository?.name}
            onChange={(value) => {
              repository?.setName(value || "");
            }}
            settings={{
              placeholder: "Add a title",
              className: "el-text-3xl el-font-bold",
            }}
          />
        </div>
        <div className="el-space-y-1">
          <MarkdownEditorControl
            value$={brief.description$}
            value={brief.description}
            onChange={(value) => brief.setDescription(value || "")}
            settings={{
              placeholder: "Describe what you want to build.",
            }}
          />
        </div>
        <div className="el-space-y-2">
          <p className="el-input el-text-2xl el-font-bold">User Goals</p>
          <UserGoalList />
        </div>
      </div>
    </ScrollArea>
  );
}
