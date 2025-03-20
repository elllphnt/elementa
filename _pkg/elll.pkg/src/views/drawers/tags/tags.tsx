import { RepositoryTag } from "@repo/backend";
import {
  Icon,
  ScrollArea,
  TreeEntry,
  elllIcons16,
  useAction,
} from "@repo/components";
import { useShell } from "@repo/shell";
import { useObservable } from "@repo/utils";
import React from "react";
import { DrawerLoader } from "~/src/components/ui/drawers/_common/drawer_loader";
import { useRepository } from "../../../hooks/backend/repository";
import { modalViews } from "../../modals/_";

function TagEntry({ tag }: { tag: RepositoryTag }): JSX.Element {
  const shell = useShell();

  const name = useObservable(tag.name$, tag.name);
  const commit = useObservable(tag.commit$, tag.commit);
  const message = useObservable(commit?.message$, commit?.message);
  const [copied, setCopied] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const ref = `${tag.repositoryId}@${tag.name}`;
    window.navigator.clipboard.writeText(ref);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <TreeEntry
      icon={
        <Icon
          className="el-text-blue el-h-4 el-w-4 el-shrink-0"
          name={elllIcons16.template}
        />
      }
      onClick={handleClick}
    >
      {copied ? (
        <span className="el-text-fg-300 el-text-sm">
          Copied ref to clipboard!
        </span>
      ) : (
        <>
          {name} <span className="el-text-fg-300 el-text-sm">{message}</span>
        </>
      )}
    </TreeEntry>
  );
}

export function TagsView(): JSX.Element {
  const shell = useShell();
  const repository = useRepository();
  const tagQuery = repository?.tags({ autoFetch: true });
  const tags = useObservable(tagQuery?.data$, tagQuery?.data) ?? [];
  const hasMore = useObservable(tagQuery?.hasMore$, tagQuery?.hasMore);
  const fetching = useObservable(tagQuery?.fetching$, tagQuery?.fetching);

  function handleCreateTag() {
    const key = shell.showModal({
      viewId: modalViews.createTag.id,
      affinity: "workspace",
      closeOnBackdropClick: true,
      closeOnEscape: true,
      props: {
        onComplete: () => {
          shell.hideModal(key);
        },
      },
    });
  }

  useAction(
    {
      title: "Create tag",
      icon: elllIcons16.plus,
      handler: handleCreateTag,
    },
    [],
  );

  if (fetching) {
    return <DrawerLoader />;
  } else if (tags.length === 0) {
    return (
      <div className="el-h-full el-w-full el-p-2">
        <div
          className="el-h-full el-w-full el-p-2 el-text-fg-400 el-flex el-flex-col el-items-center el-justify-center el-text-center el-gap-2 hover:el-bg-bg-200/50 el-transition-colors el-cursor-pointer el-rounded"
          onClick={handleCreateTag}
        >
          <Icon name={elllIcons16.plus} className="el-h-4 el-w-4" />

          <p>
            Tags are used to mark specific points in the repository's history.
          </p>
          <p>Click to create a tag to mark a specific commit.</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea
      scrollY
      containerClassName="el-space-y-1 el-px-2 el-pt-1 el-pb-2"
    >
      {tags.map((tag) => (
        <TagEntry key={tag.id} tag={tag} />
      ))}

      {hasMore ? (
        <div>
          <button
            className="el-pl-2 el-text-fg-500 hover:el-text-fg-500 el-text-sm"
            onClick={() => {
              if (tagQuery?.fetching) {
                return;
              }
              tagQuery?.fetch();
            }}
            disabled={fetching}
          >
            {fetching ? "Loading..." : "Load more"}
          </button>
        </div>
      ) : null}
    </ScrollArea>
  );
}
