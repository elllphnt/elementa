import { Library } from "@repo/backend";
import { ProgressBar, ScrollArea, useControlMenu } from "@repo/components";
import { useObservable } from "@repo/utils";
import cx from "classnames";
import { usePublicLibraries } from "../../../hooks/backend/libraries";
import { useWorkspaceState } from "../../../hooks/shell/workspace";
import { modalViews } from "../_";

function LibraryListItem({
  library,
  onClick,
}: {
  library: Library;
  onClick?: () => void;
}) {
  const name = useObservable(library.name$, library.name);
  const version = useObservable(library.latestVersion$, library.latestVersion);

  return (
    <div
      className={cx(
        "el-p-2 el-cursor-pointer el-border el-rounded el-space-y-1 hover:el-bg-bg/5",
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.();
      }}
    >
      <div className="flex-grow el-font-semibold">{name}</div>
      <div className="el-text-sm el-text-fg">{version}</div>
    </div>
  );
}

export function LibraryBrowser(): JSX.Element {
  const stateKey = ["library-browser"];
  const [search, setSearch] = useWorkspaceState<string>(
    [...stateKey, "search"],
    "",
  );
  const [libraries, { fetching }] = usePublicLibraries({ search });
  const { openMenu } = useControlMenu();

  let content = <></>;

  if (!libraries.length && !search) {
    content = (
      <div className="el-h-full el-w-full el-rounded el-p-3 el-flex el-flex-col el-items-center el-justify-center el-text-center el-text-fg el-text-sm">
        Start typing to search for libraries.
      </div>
    );
  } else if (!libraries.length && !fetching) {
    content = (
      <div className="el-h-full el-w-full el-rounded el-p-3 el-flex el-flex-col el-items-center el-justify-center el-text-center el-text-fg el-text-sm">
        No libraries found.
      </div>
    );
  } else {
    content = (
      <ScrollArea scrollY containerClassName="el-space-y-2">
        {libraries.map((library) => (
          <LibraryListItem
            key={library.id}
            library={library}
            onClick={() => {
              openMenu({
                title: "Library",
                viewId: modalViews.libraryViewer.id,
                props: {
                  library,
                },
              });
            }}
          />
        ))}
      </ScrollArea>
    );
  }

  return (
    <div className="el-h-full el-w-full el-flex el-flex-col el-space-y-2">
      <div
        style={{
          position: "relative",
        }}
        className="el-shrink-0 el-w-full el-rounded el-overflow-hidden"
      >
        <input
          className="el-w-full el-h-8 el-px-2 el-outline-none el-border el-rounded"
          placeholder="Search libraries"
          value={search}
          style={{
            resize: "none",
            display: "block",
            background: "transparent",
          }}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -1,
            left: 0,
            right: 0,
          }}
        >
          {fetching && <ProgressBar />}
        </div>
      </div>

      <div
        className="grow"
        style={{
          overflow: "hidden",
        }}
      >
        {content}
      </div>
    </div>
  );
}
