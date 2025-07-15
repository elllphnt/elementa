import { useObservable } from "@elllphnt/elementa-react-utils";
import { File, Folder, FolderRoot } from "lucide-react";
import { useEffect } from "react";
import { backend } from "../../../backend/backend.js";
import type {
  DirectoryEntryData,
  FileEntryData,
  FileTreeData,
  ProjectData,
} from "../../../backend/types.js";
import { fileListToFileTree } from "../../../backend/utils.js";
import { TreeEntry } from "../../../components/tree/tree_entry.js";
import { TreeIndent } from "../../../components/tree/tree_indent.js";
import { useViewerState } from "../../state.js";

function FileTreeEntries({
  trees,
  projectId,
  parentPath = "",
}: {
  trees: FileTreeData[];
  projectId: string;
  parentPath?: string;
}) {
  const sorted = trees.sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name);
    } else {
      return a.type.localeCompare(b.type);
    }
  });

  return (
    <TreeIndent>
      {sorted.map((tree) => (
        <FileTreeEntry
          key={tree.name}
          tree={tree}
          projectId={projectId}
          parentPath={parentPath}
        />
      ))}
    </TreeIndent>
  );
}

function DirectoryEntry({
  entry,
  projectId,
  parentPath = "",
}: {
  entry: DirectoryEntryData;
  projectId: string;
  parentPath?: string;
}) {
  const { explorer, setExplorerFolderState } = useViewerState();
  const currentPath = parentPath ? `${parentPath}/${entry.name}` : entry.name;
  const folderKey = `${projectId}:${currentPath}`;
  const open = explorer.folders?.[folderKey] || false;

  const setOpen = (isOpen: boolean) => {
    setExplorerFolderState(folderKey, isOpen);
  };

  return (
    <>
      <TreeEntry
        container
        nested
        open={open}
        icon={<Folder />}
        onClick={() => setOpen(!open)}
        onToggleOpen={setOpen}
      >
        {entry.name}
      </TreeEntry>

      {open && (
        <FileTreeEntries
          trees={entry.entries}
          projectId={projectId}
          parentPath={currentPath}
        />
      )}
    </>
  );
}
function FileEntry({
  entry,
  projectId,
}: {
  entry: FileEntryData;
  projectId: string;
}) {
  const { setBoardData, board } = useViewerState();

  const handleClick = () => {
    setBoardData(projectId, entry.data.id);
  };

  return (
    <TreeEntry
      nested
      icon={<File />}
      onClick={handleClick}
      active={board.fileId === entry.data.id && board.projectId === projectId}
    >
      {entry.name}
    </TreeEntry>
  );
}
function FileTreeEntry({
  tree,
  projectId,
  parentPath = "",
}: {
  tree: FileTreeData;
  projectId: string;
  parentPath?: string;
}) {
  if (tree.type === "file") {
    return <FileEntry key={tree.type} entry={tree} projectId={projectId} />;
  } else {
    return (
      <DirectoryEntry
        key={tree.type}
        entry={tree}
        projectId={projectId}
        parentPath={parentPath}
      />
    );
  }
}

function ProjectEntry({ project }: { project: ProjectData }) {
  const { explorer, setExplorerFolderState } = useViewerState();
  const projectKey = `project:${project.id}`;
  const open = explorer.folders?.[projectKey] || false;
  const status = useObservable(
    backend.projectFilesStatus$(project.id),
    backend.projectFilesStatus(project.id)
  );
  const files = useObservable(
    backend.projectFiles$(project.id),
    backend.projectFiles(project.id)
  );

  const toogle = (open: boolean) => {
    setExplorerFolderState(projectKey, open);
  };

  useEffect(() => {
    if (open && status === "idle") {
      backend.fetchProjectFiles(project.id);
    }
  }, [open, status, project.id]);

  const trees = fileListToFileTree(files);

  return (
    <>
      <TreeEntry
        container
        nested
        open={open}
        icon={<FolderRoot />}
        loading={status === "loading"}
        onClick={() => toogle(!open)}
        onToggleOpen={toogle}
      >
        {project.name}
      </TreeEntry>

      {open ? <FileTreeEntries trees={trees} projectId={project.id} /> : <></>}
    </>
  );
}

export function Explorer() {
  const projects = useObservable(backend.projects$, backend.projects);
  const status = useObservable(backend.projectsStatus$, backend.projectsStatus);

  useEffect(() => {
    backend.fetchProjects();
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-full p-4">
        Loading projects...
      </div>
    );
  } else if (status === "loaded") {
    if (projects.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          No projects found.
        </div>
      );
    }

    return (
      <div className="space-y-1 p-4">
        {projects.map((project) => (
          <ProjectEntry key={project.id} project={project} />
        ))}
      </div>
    );
  }

  return <></>;
}
