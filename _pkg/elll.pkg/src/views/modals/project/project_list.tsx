import { Repository } from "@repo/backend";
import {
  elllIcons16,
  Icon,
  ProgressBar,
  ScrollArea,
  TreeEntry,
} from "@repo/components";
import { useObservable } from "@repo/utils";
import { useElll } from "~/src/hooks/elll/elll";

function ProjectEntry({ project }: { project: Repository }) {
  const elll = useElll();
  const name = useObservable(project.name$, project.name);
  return (
    <TreeEntry
      icon={<Icon name={elllIcons16.folderClosed} />}
      onClick={() => {
        elll.host.openProject(project.id);
      }}
    >
      {name}
    </TreeEntry>
  );
}

export function ProjectList(): JSX.Element {
  const elll = useElll();
  const tenant = useObservable(elll.tenant$, elll.tenant);
  const projectQuery = tenant?.repositories({ autoFetch: true });
  const projects = useObservable(projectQuery?.data$, projectQuery?.data);
  const fetching = useObservable(
    projectQuery?.fetching$,
    projectQuery?.fetching,
  );

  return (
    <div
      style={{
        height: 360,
        width: 500,
        position: "relative",
      }}
    >
      {fetching && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          <ProgressBar />
        </div>
      )}

      <ScrollArea scrollY containerClassName="el-p-3 el-space-y-2">
        {projects?.map((project) => (
          <ProjectEntry key={project.id} project={project} />
        ))}
      </ScrollArea>
    </div>
  );
}
