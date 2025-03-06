import { Repository, RepositoryTag } from "@repo/backend";
import {
  Icon,
  IconButton,
  ScrollArea,
  TreeEntry,
  elllIcons16,
  useAction,
} from "@repo/components";
import { useManyObservables, useObservable } from "@repo/utils";
import { useState } from "react";
import { useBackend } from "~/src/hooks/backend/backend";
import { useTenant } from "~/src/hooks/backend/tenant";
import { useProjectLibraries } from "~/src/hooks/project/libraries";
import { useElllProject } from "~/src/hooks/project/project";

function LibraryEntry({ tagId }: { tagId: string }) {
  const project = useElllProject();
  const backend = useBackend();
  const tag = backend.instance<RepositoryTag>(tagId, true);
  const repositoryId = useObservable(tag?.repositoryId$, tag?.repositoryId);
  const repository = repositoryId
    ? backend.instance<Repository>(repositoryId)
    : undefined;

  const repositoryName = useObservable(repository?.name$, repository?.name);
  const tagName = useObservable(tag?.name$, tag?.name);

  return (
    <TreeEntry
      icon={<Icon name={elllIcons16.package} />}
      actions={[
        {
          icon: <Icon name={elllIcons16.cross} />,
          handler: () => {
            project.libraryManager.removeLibrary(tagId);
          },
        },
      ]}
    >
      {repositoryName}{" "}
      <span className="el-text-sm el-text-fg-300">{tagName}</span>
    </TreeEntry>
  );
}

function SearchLibraryEntry({ tagId }: { tagId: string }) {
  const project = useElllProject();
  const backend = useBackend();
  const tag = backend.instance<RepositoryTag>(tagId, true);
  const repositoryId = useObservable(tag?.repositoryId$, tag?.repositoryId);
  const repository = repositoryId
    ? backend.instance<Repository>(repositoryId)
    : undefined;

  const repositoryName = useObservable(repository?.name$, repository?.name);
  const tagName = useObservable(tag?.name$, tag?.name);

  return (
    <TreeEntry
      icon={<Icon name={elllIcons16.package} />}
      actions={[
        {
          icon: <Icon name={elllIcons16.export} />,
          handler: () => {
            project.libraryManager.installLibrary(tagId);
          },
        },
      ]}
    >
      {repositoryName}{" "}
      <span className="el-text-sm el-text-fg-300">{tagName}</span>
    </TreeEntry>
  );
}

export function LibraryList({
  onModeChange,
}: {
  onModeChange: (mode: "list" | "search") => void;
}): JSX.Element {
  const libraries = useProjectLibraries();

  useAction({
    title: "Search libraries",
    icon: elllIcons16.package,
    handler: () => {
      onModeChange("search");
    },
  });

  let content = <></>;

  if (!libraries.length) {
    content = (
      <div className="el-h-full el-w-full el-p-2 el-pt-1">
        <button
          className="el-h-full el-w-full el-rounded el-p-3 el-flex el-flex-col el-items-center el-justify-center hover:el-bg-bg-200/50 el-text-center el-text-fg-400 el-text-sm"
          onClick={() => onModeChange("search")}
        >
          This project does not have any libraries.
          <br />
          Click to add a library.
        </button>
      </div>
    );
  } else {
    content = (
      <ScrollArea
        scrollY
        containerClassName="el-h-full el-w-full el-space-y-2 el-p-2 el-pt-1"
      >
        {libraries.map((tagId) => (
          <LibraryEntry key={tagId} tagId={tagId} />
        ))}
      </ScrollArea>
    );
  }

  return <>{content}</>;
}

export function LibrarySearch({
  onModeChange,
}: {
  onModeChange: (mode: "list" | "search") => void;
}): JSX.Element {
  const tenant = useTenant();
  const repositoriesQuery = tenant?.repositories({ autoFetch: true });
  const repositories = useObservable(
    repositoriesQuery?.data$,
    repositoriesQuery?.data,
  );
  const pointers = useManyObservables(
    repositories?.map((repository) => repository.pointer$("latest")) ?? [],
    repositories?.map((repository) => repository.pointer("latest")) ?? [],
    repositories?.map((r) => r.id).join("."),
  ).filter(Boolean) as Array<{
    name: string;
    tag_id: string;
  }>;

  let content = <></>;

  if (!pointers.length) {
    content = (
      <div className="el-h-full el-w-full el-p-2 el-pt-1">
        <div className="el-h-full el-w-full el-rounded el-p-3 el-flex el-flex-col el-items-center el-justify-center el-text-center el-text-fg-400 el-text-sm">
          This tenant does not have any libraries.
        </div>
      </div>
    );
  } else {
    content = (
      <div className="el-h-full el-w-full">
        <div className="el-px-2 el-pb-1 el-flex el-gap-1">
          <input
            autoFocus
            className="el-border el-h-7 el-w-full el-px-2 el-rounded"
            placeholder="Search libraries"
          />
          <IconButton
            className="el-h-7 el-w-7"
            icon={elllIcons16.cross}
            onClick={() => onModeChange("list")}
          />
        </div>
        <ScrollArea
          scrollY
          containerClassName="el-h-full el-w-full el-space-y-2 el-p-2 el-pt-1"
        >
          {pointers.map((pointer) => (
            <SearchLibraryEntry key={pointer.tag_id} tagId={pointer.tag_id} />
          ))}
        </ScrollArea>
      </div>
    );
  }

  return <>{content}</>;
}

export function LibrariesView(): JSX.Element {
  const [mode, setMode] = useState<"list" | "search">("list");

  if (mode === "list") {
    return <LibraryList onModeChange={setMode} />;
  } else {
    return <LibrarySearch onModeChange={setMode} />;
  }
}
