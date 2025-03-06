import { ProgressBar, ScrollArea, useControlMenu } from "@repo/components";
import cx from "classnames";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useWorkspaceState } from "../../../hooks/shell/workspace";
import { modalViews } from "../_";
import { PackageDetails, searchNpmPackages } from "~/src/libs/npm";

function NpmPackageListItem({
  data,
  onClick,
  active,
}: {
  data: PackageDetails;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <div
      className={cx(
        "el-p-2 el-cursor-pointer el-rounded el-py-1 el-space-y-0.5",
        {
          "hover:el-bg-bg/10": !active,
          "el-bg-bg/10": active,
        },
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.();
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="el-grow">{data.name}</div>
        <div className="el-text-sm el-text-fg">{data.version}</div>
      </div>
      <div className="el-text-sm el-text-fg">{data.description}</div>
    </div>
  );
}

const deboucedSearch = _.debounce(
  ({
    search,
    setFetching,
    setPackages,
  }: {
    search: string;
    setFetching: (fetching: boolean) => void;
    setPackages: (packages: any[]) => void;
  }) => {
    setFetching(true);
    searchNpmPackages(search)
      .then((packages) => {
        setPackages(packages);
      })
      .finally(() => {
        setFetching(false);
      });
  },
  500,
);

export function NpmPackageBrowser(): JSX.Element {
  const stateKey = ["npm-package-browser"];
  const [search, setSearch] = useWorkspaceState<string>(
    [...stateKey, "search"],
    "",
  );
  const [packages, setPackages] = useState<PackageDetails[]>([]);
  const [fetching, setFetching] = useState(false);
  const { openMenu } = useControlMenu();

  // get npm packages
  useEffect(() => {
    deboucedSearch({
      search,
      setFetching,
      setPackages,
    });
  }, [search]);

  let content = <></>;

  if (!packages.length && !search) {
    content = (
      <div className="el-h-full el-w-full el-rounded el-p-3 el-flex el-flex-col el-items-center el-justify-center el-text-center el-text-fg el-text-sm">
        Start typing to search for packages.
      </div>
    );
  } else if (!packages.length && !fetching) {
    content = (
      <div className="el-h-full el-w-full el-rounded el-p-3 el-flex el-flex-col el-items-center el-justify-center el-text-center el-text-fg el-text-sm">
        No packages found.
      </div>
    );
  } else {
    content = (
      <ScrollArea scrollY containerClassName="el-space-y-2">
        {packages.map((pkg) => (
          <NpmPackageListItem
            key={pkg.name}
            data={pkg}
            onClick={() => {
              openMenu({
                title: "Package",
                viewId: modalViews.npmPackageViewer.id,
                props: { name: pkg.name },
              });
            }}
          />
        ))}
      </ScrollArea>
    );
  }

  return (
    <div
      style={{
        width: 320,
      }}
      className="el-h-full el-w-full el-flex el-flex-col el-space-y-2"
    >
      <div
        style={{
          position: "relative",
        }}
        className="el-shrink-0 el-w-full el-rounded el-overflow-hidden"
      >
        <input
          className="el-w-full el-h-8 el-px-2 el-outline-none el-border el-rounded"
          placeholder="Search packages"
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
