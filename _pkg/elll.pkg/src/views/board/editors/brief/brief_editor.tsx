import {
  ControlProps,
  elllIcons16,
  Icon,
  IconButton,
  Popper,
  ProgressBar,
  ScrollArea,
  TextAreaControl,
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
  app,
  feature,
  stateKey,
  onRemove,
}: {
  app: ElllApp;
  feature: Content<string>;
  stateKey?: string[];
  onRemove: () => void;
}) {
  const generatingBrief = useObservable(
    app.isFeatureBriefGenerating$(feature.url),
    app.isFeatureBriefGenerating(feature.url),
  );
  const content = useObservable(feature.data$, feature.data);
  const name = useObservable(feature.name$, feature.name);
  const [open, setOpen] = useWorkspaceState(
    [...(stateKey || []), "open"],
    true,
  );

  return (
    <div className="el-relative el-group el-space-y-1 el-bg-bg-200/30 el-rounded">
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
          className={cx("el-input el-font-semibold el-grow", {
            "el-text-fg-500 el-text-lg": !open,
            "el-text-fg-400": open,
          })}
          value={name}
          onChange={(e) => {
            feature.setName(e.target.value);
          }}
        />
        <div className="el-hidden group-hover:el-flex el-items-center el-gap-1 ">
          <IconButton
            icon={elllIcons16.refresh}
            iconClassName="el-text-fg-400"
            onClick={() => {
              app.generateFeatureBrief(feature.url);
            }}
          />

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

      {generatingBrief ? (
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
          app={project.app}
        />
      ))}
      <AddFeatureButton app={project.app} />
    </div>
  );
}

export function BriefRefreshButton({
  app,
  className,
}: {
  app: ElllApp;
  className?: string;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | undefined>(undefined);
  const [prompt, setPrompt] = useState<string | undefined>(undefined);
  return (
    <>
      <IconButton
        icon={elllIcons16.refresh}
        iconClassName={cx("el-text-fg-400", className)}
        onClick={(e) => setAnchor(e.currentTarget)}
      />
      <Popper
        filled
        border
        shadow
        anchor={anchor}
        onClose={() => setAnchor(undefined)}
        align="center"
        position="bottom"
        offset={8}
        exclusive
      >
        <div style={{ width: 240 }} className="el-p-2 el-space-y-2">
          <TextAreaControl
            value={prompt}
            onChange={(value) => setPrompt(value || "")}
            settings={{
              minRows: 3,
              maxRows: 5,
              placeholder: "Add a prompt to generate a new brief",
            }}
          />
          <div className="el-flex el-justify-end el-gap-2">
            <button
              className="el-bg-pm el-text-pm-ctr el-h-6 el-px-2 el-rounded"
              onClick={async () => {
                if (!prompt) return;
                app.generateBrief({
                  prompt,
                });
                setAnchor(undefined);
              }}
            >
              Generate
            </button>
          </div>
        </div>
      </Popper>
    </>
  );
}

export function BriefEditor() {
  const repository = useRepository();
  const project = useElllProject();
  const app = project.app;
  const generatingBrief = useObservable(
    app.generatingBrief$,
    app.generatingBrief,
  );
  const generatingFeatures = useObservable(
    app.generatingFeatures$,
    app.generatingFeatures,
  );
  const loading = useObservable(app.loading$, app.loading);
  const loaded = useObservable(app.loaded$, app.loaded);
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
        <div className="el-flex el-items-end">
          <div className="el-grow">
            <NakedTextControl
              value$={repository?.name$}
              value={repository?.name}
              onChange={(value) => {
                repository?.setName(value || "");
              }}
              settings={{
                placeholder: "Add a title",
                className: "el-text-3xl el-font-bold el-w-full",
              }}
            />
          </div>
          <div className="el-flex el-gap-2">
            <BriefRefreshButton app={app} />
          </div>
        </div>
        {loading || generatingBrief ? <ProgressBar height={1} /> : <hr />}
        {loaded ? (
          <>
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
            <div className="el-space-y-6">
              <div className="el-flex el-items-end el-justify-between">
                <p className="el-input el-text-2xl el-font-bold">Features</p>
                <div className="el-flex el-gap-2">
                  <IconButton
                    icon={elllIcons16.refresh}
                    onClick={() => {
                      app.generateFeatures();
                    }}
                  />
                </div>
              </div>

              {loading || generatingFeatures ? (
                <ProgressBar height={1} />
              ) : (
                <hr />
              )}

              <FeatureList />
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </ScrollArea>
  );
}
