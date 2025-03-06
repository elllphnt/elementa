import { Library } from "@repo/backend";
import { useObservable } from "@repo/utils";
import { useProjectLibraries } from "../../../hooks/project/libraries";
import { useElllProject } from "../../../hooks/project/project";
import { LibraryDependencyData } from "../../../libs/project/libraries/library_store";

export function LibraryViewer({ library }: { library: Library }): JSX.Element {
  const projectLibraries = useProjectLibraries();
  const project = useElllProject();
  const latestVersion = useObservable(
    library.latestVersion$,
    library.latestVersion,
  );
  const tenant = useObservable(library.tenant$, library.tenant);
  const tenantName = useObservable(tenant?.name$, tenant?.name);
  const name = useObservable(library.name$, library.name);

  let authorContent = <></>;
  if (tenantName) {
    authorContent = (
      <p>
        <span className="el-text-sm el-text-fg">by {tenantName}</span>
      </p>
    );
  }

  const installedLibrary = projectLibraries.find(
    (lib) => lib.libraryId === library.id,
  );
  let actionButtons = [];

  if (latestVersion) {
    const installData: LibraryDependencyData = {
      libraryId: library.id,
      version: latestVersion,
    };

    if (!installedLibrary) {
      actionButtons.push(
        <button
          key="install"
          className="el-h-6 el-px-2 el-rounded el-bg-pm el-text-pm-ctr el-text-sm"
          onClick={() => {
            project.libraryStore.installLibrary(installData);
          }}
        >
          Install
        </button>,
      );
    } else {
      if (installedLibrary.version !== latestVersion) {
        actionButtons.push(
          <button
            key="update"
            className="el-h-6 el-px-2 el-rounded el-bg-pm el-text-pm-ctr el-text-sm"
            onClick={() => {
              project.libraryStore.installLibrary(installData);
            }}
          >
            Update
          </button>,
        );
      }

      actionButtons.push(
        <button
          key="uninstall"
          className="el-h-6 el-px-2 el-rounded el-bg-red el-text-pm-ctr el-text-sm"
          onClick={() => {
            project.libraryStore.removeLibrary(installData);
          }}
        >
          Remove
        </button>,
      );
    }
  }

  return (
    <div className="el-h-full">
      <div className="el-h-full el-flex el-flex-col el-space-y-2">
        <div className="flex el-gap-4">
          <div className="grow el-space-y-2">
            <p>
              <span className="el-text-xl el-font-semibold">{name}</span>{" "}
              <span className="el-text-sm el-text-fg">{latestVersion}</span>
            </p>
            {authorContent}
          </div>

          <div className="flex el-flex-col el-gap-2 items-end">
            {actionButtons}
          </div>
        </div>
        <hr />
        <div
          className="grow"
          style={{
            overflow: "hidden",
          }}
        ></div>
      </div>
    </div>
  );
}
