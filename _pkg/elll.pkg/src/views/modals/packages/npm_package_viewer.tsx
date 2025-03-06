import { ProgressBar } from "@repo/components";
import { useEffect, useState } from "react";
import { MarkdownViewer } from "~/src/components/markdown/markdown_viewer";
import { useProjectPackages } from "~/src/hooks/project/packages";
import { useElllProject } from "~/src/hooks/project/project";
import { getNpmPackage, NpmGetPackageResult } from "~/src/libs/npm";

type PackageData = {
  name: string;
  registry: string;
  version: string;
};

export function NpmPackageViewer({ name }: { name: string }): JSX.Element {
  const [pkg, setPackage] = useState<NpmGetPackageResult>();
  const [fetching, setFetching] = useState(false);
  const projectPackages = useProjectPackages();
  const project = useElllProject();

  // get npm packages
  useEffect(() => {
    setFetching(true);
    getNpmPackage(name)
      .then((pkg) => {
        setPackage(pkg);
      })
      .finally(() => {
        setFetching(false);
      });
  }, []);

  let content = <></>;

  if (fetching) {
    content = (
      <div className="el-h-full el-w-full el-flex el-flex-col el-gap-2 el-items-center el-justify-center">
        <div className="el-text-sm el-text-fg">{name}</div>
        <div
          style={{
            width: 40,
          }}
        >
          <ProgressBar />
        </div>
      </div>
    );
  } else if (!pkg && !fetching) {
    content = (
      <div className="el-h-full el-w-full el-rounded el-p-3 el-flex el-flex-col el-items-center el-justify-center el-text-center el-text-fg el-text-sm">
        Package not found
      </div>
    );
  } else {
    const latest = pkg?.versions[pkg?.["dist-tags"].latest];
    let author = pkg?.author;
    let authorContent = <></>;

    if (author) {
      const name = author.name || author.username;
      const url =
        author.url || author.username
          ? `https://www.npmjs.com/~${author.username}`
          : undefined;

      if (url && name) {
        authorContent = (
          <p>
            <span className="el-text-sm el-text-fg">
              by{" "}
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="el-text-pm"
              >
                {name}
              </a>
            </span>
          </p>
        );
      } else if (name) {
        authorContent = (
          <p>
            <span className="el-text-sm el-text-fg">by {name}</span>
          </p>
        );
      }
    }

    const installedPackage = projectPackages.find(
      (pkg) => pkg.name === name && pkg.registry === "npm",
    );
    let actionButtons = [];

    if (latest) {
      const installData: PackageData = {
        name: name,
        registry: "npm",
        version: latest?.version,
      };

      if (!installedPackage) {
        actionButtons.push(
          <button
            key="install"
            className="el-h-6 el-px-2 el-rounded el-bg-pm el-text-pm-ctr el-text-sm"
            onClick={() => {
              project.packageManager.installPackage(installData);
            }}
          >
            Install
          </button>,
        );
      } else {
        if (installedPackage.version !== latest?.version) {
          actionButtons.push(
            <button
              key="update"
              className="el-h-6 el-px-2 el-rounded el-bg-pm el-text-pm-ctr el-text-sm"
              onClick={() => {
                project.packageManager.installPackage(installData);
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
              project.packageManager.removePackage(installData);
            }}
          >
            Remove
          </button>,
        );
      }
    }

    content = (
      <div className="el-h-full el-flex el-flex-col el-space-y-2">
        <div className="el-flex el-gap-4">
          <div className="el-grow el-space-y-2">
            <p>
              <span className="el-text-xl el-font-semibold">{pkg?.name}</span>{" "}
              <span className="el-text-sm el-text-fg">{latest?.version}</span>
            </p>
            <p className="el-text-sm el-text-fg">{pkg?.description}</p>
            {authorContent}
          </div>

          <div className="el-flex el-flex-col el-gap-2 items-end">
            {actionButtons}
          </div>
        </div>
        <hr />
        <div
          className="el-grow"
          style={{
            overflow: "hidden",
          }}
        >
          <MarkdownViewer md={pkg?.readme} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="el-h-full"
      style={{
        width: 320,
        height: 400,
      }}
    >
      {content}
    </div>
  );
}
