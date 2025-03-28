import { RepositoryTag } from "@repo/backend";
import {
  ActionRegistry,
  ActionRegistryContext,
  Icon,
  ProgressBar,
  TreeHeading,
  TreeIndent,
} from "@repo/components";
import { useObservable } from "@repo/utils";
import { ReactNode, useMemo } from "react";
import { WorkspaceDirectoryTree } from "~/src/components/ui/trees/workspace_directory/workspace_directory_tree";
import { useBackend } from "~/src/hooks/backend/backend";
import { useWorkspaceFileAtPath } from "~/src/hooks/backend/file";
import { useWorkspaceState } from "~/src/hooks/shell/workspace";
import { WorkspaceOnlyFilesView } from "./workspace_only";

function WorkspaceFiles(): JSX.Element {
  const [directory, query] = useWorkspaceFileAtPath("", {
    type: "directory",
  });
  const fetching = useObservable(query?.fetching$, query?.fetching);

  if (!fetching) {
    return (
      <div className="el-h-full el-w-full el-text-sm el-flex el-flex-col el-gap-2 el-items-center el-justify-center el-text-fg">
        <div className="font-mono">/</div>
        <div
          style={{
            width: 40,
          }}
        >
          <ProgressBar />
        </div>
      </div>
    );
  }

  if (!directory) {
    return (
      <div className="el-h-full el-w-full el-text-sm el-flex el-flex-col el-gap-2 el-items-center el-justify-center el-text-fg">
        Directory not found
        <div className="font-mono">/</div>
      </div>
    );
  }

  return <WorkspaceDirectoryTree directory={directory} />;
}

function LibraryFiles({ tagId }: { tagId: string }): JSX.Element {
  const backend = useBackend();
  const tag = backend.instance<RepositoryTag>(tagId, true);
  const commit = useObservable(tag.commit$, tag.commit);
  const query = commit?.fileAtPath("", { autoFetch: true });
  const directory = useObservable(query?.data$, query?.data);
  const fetching = useObservable(query?.fetching$, query?.fetching);

  if (fetching) {
    return (
      <div className="el-h-full el-w-full el-text-sm el-flex el-flex-col el-gap-2 el-items-center el-justify-center el-text-fg">
        <div className="font-mono">/</div>
        <div
          style={{
            width: 40,
          }}
        >
          <ProgressBar />
        </div>
      </div>
    );
  }

  if (!directory) {
    return (
      <div className="el-h-full el-w-full el-text-sm el-flex el-flex-col el-gap-2 el-items-center el-justify-center el-text-fg">
        Directory not found
        <div className="font-mono">/</div>
      </div>
    );
  }

  return <WorkspaceDirectoryTree directory={directory} />;
}

function FilesSection({
  title,
  stateKey,
  content: Content,
}: {
  title: string;
  stateKey: string[];
  content: ({ open }: { open: boolean }) => ReactNode;
}) {
  const [open, setOpen] = useWorkspaceState<boolean>(stateKey);
  const actionRegistry = useMemo(() => new ActionRegistry(), []);
  const actions = useObservable(
    actionRegistry.actions$,
    actionRegistry.actions,
  );
  return (
    <div>
      <ActionRegistryContext.Provider value={actionRegistry}>
        <TreeHeading
          nested
          noIcon
          container
          onToggleOpen={setOpen}
          open={open}
          className="el-bg-bg"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
          onClick={() => setOpen(!open)}
          actions={actions.map((action) => ({
            icon: <Icon name={action.icon} />,
            handler: action.handler,
          }))}
        >
          {title}
        </TreeHeading>
        <TreeIndent>
          <Content open={open ?? false} />
        </TreeIndent>
      </ActionRegistryContext.Provider>
    </div>
  );
}

export function FilesView(): JSX.Element {
  // const libraries = useProjectLibraries();

  // if (libraries.length) {
  //   return (
  //     <ScrollArea
  //       scrollY
  //       containerClassName="el-p-2"
  //       containerStyle={{ paddingTop: 0 }}
  //     >
  //       <FilesSection
  //         title="Local"
  //         stateKey={["files", "sections", "workspace"]}
  //         content={({ open }) => (open ? <WorkspaceFiles /> : <></>)}
  //       />
  //       {libraries.map((tagId) => (
  //         <FilesSection
  //           key={tagId}
  //           title={tagId}
  //           stateKey={["files", "sections", tagId]}
  //           content={({ open }) =>
  //             open ? <LibraryFiles tagId={tagId} /> : <></>
  //           }
  //         />
  //       ))}
  //     </ScrollArea>
  //   );
  // } else {
  // }
  return <WorkspaceOnlyFilesView />;
}
