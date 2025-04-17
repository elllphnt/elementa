import {
  ControlProps,
  elllIcons16,
  Icon,
  IconButton,
  ProgressBar,
  ScrollArea,
  useControlValue,
} from "@repo/components";
import { useObservable } from "@repo/utils";
import cx from "classnames";
import { useState } from "react";
import {
  MarkdownEditor,
  MarkdownEditorControl,
} from "~/src/components/libs/markdown_editor/markdown_editor";
import { useRepository } from "~/src/hooks/backend/repository";
import { useElllProject } from "~/src/hooks/project/project";
import { useWorkspaceState } from "~/src/hooks/shell/workspace";
import { ElllApp } from "~/src/modules/elementa/project/app/app";
import { Content } from "~/src/modules/elll/content/content";

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

export function FeatureListItem({
  feature,
  stateKey,
  onRemove,
}: {
  feature: Content<string>;
  stateKey?: string[];
  onRemove: () => void;
}) {
  const content = useObservable(feature.data$, feature.data);
  const name = useObservable(feature.name$, feature.name);
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
          value={name}
          onChange={(e) => {
            feature.setName(e.target.value);
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
        <div
          className="el-px-3 el-pb-2"
          style={{
            maxHeight: 300,
            overflowY: "auto",
          }}
        >
          <MarkdownEditor
            value={content}
            onChange={(value) => {
              feature.update(value || "");
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
function AddFeatureButton({ app }: { app: ElllApp }) {
  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  let loader = <></>;

  if (creating) {
    loader = (
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <ProgressBar />
      </div>
    );
  }

  if (adding) {
    return (
      <div className="el-h-9 el-relative el-overflow-hidden el-flex el-items-center el-gap-2 el-justify-center el-py-2 el-px-3 el-rounded el-bg-bg-200/30 el-text-fg-400 hover:el-bg-bg-200/50">
        <input
          autoFocus
          style={{
            width: "100%",
            height: "100%",
          }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Feature name"
          className="el-text-fg-400"
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              try {
                setName("");
                setAdding(false);
                setCreating(true);
                const trimmedName = name.trim();
                if (!trimmedName) return;
                await app.addFeature(trimmedName);
              } finally {
                setCreating(false);
              }
            }
          }}
          onBlur={() => {
            setAdding(false);
            setName("");
          }}
        />
      </div>
    );
  } else {
    return (
      <button
        className="el-relative el-overflow-hidden el-flex el-items-center el-gap-2 el-justify-center el-p-2 el-rounded el-bg-bg-200/30 el-text-fg-400 hover:el-bg-bg-200/50"
        onClick={() => setAdding(true)}
      >
        <Icon name={elllIcons16.plus} />
        <span className="el-text-fg-400">Add a feature</span>

        {loader}
      </button>
    );
  }
}
export function FeatureList() {
  const project = useElllProject();
  const features = useObservable(project.app.features$, project.app.features);
  return (
    <div className="el-flex el-flex-col el-gap-2">
      {features.map((feature, index) => (
        <FeatureListItem
          key={index}
          feature={feature}
          stateKey={[`user-goal-${index}`]}
          onRemove={() => {
            project.app.removeFeature(index);
          }}
        />
      ))}
      <AddFeatureButton app={project.app} />
    </div>
  );
}

export function BriefEditor() {
  const repository = useRepository();
  const project = useElllProject();
  const app = project.app;
  const brief = useObservable(app.briefContent$, app.briefContent);

  return (
    <ScrollArea scrollY>
      <div
        className="el-flex el-flex-col el-gap-4 el-p-6"
        style={{
          margin: "0 auto",
          maxWidth: 800,
          paddingBottom: 48,
        }}
      >
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
        <hr />
        <div className="el-space-y-1">
          <MarkdownEditorControl
            value$={brief?.data$}
            value={brief?.data}
            onChange={(value) => brief?.update(value || "")}
            settings={{
              placeholder:
                "Describe what your app is about, how its parts fit together, and what the user should experience.",
            }}
          />
        </div>
        <div className="el-space-y-2">
          <p className="el-input el-text-2xl el-font-bold">Features</p>
          <FeatureList />
        </div>
      </div>
    </ScrollArea>
  );
}
