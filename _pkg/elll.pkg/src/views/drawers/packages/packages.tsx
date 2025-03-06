import {
  Icon,
  ScrollArea,
  TreeEntry,
  elllIcons16,
  useAction,
  useControlMenu,
} from "@repo/components";
import { useProjectPackages } from "~/src/hooks/project/packages";
import { modalViews } from "../../modals/_";

export function PackagesView(): JSX.Element {
  const packages = useProjectPackages();
  const { openMenu } = useControlMenu();

  useAction({
    title: "Add package",
    icon: elllIcons16.package,
    handler: () => {
      openMenu({
        title: "Add package",
        viewId: modalViews.packageBrowser.id,
      });
    },
  });

  const handleOpenPackage = (pkg: any) => {
    switch (pkg.registry) {
      case "npm": {
        openMenu({
          title: "Package",
          viewId: modalViews.npmPackageViewer.id,
          props: { name: pkg.name },
        });
        break;
      }
    }
  };

  let content = <></>;

  if (!packages.length) {
    content = (
      <div className="el-h-full el-w-full el-p-2 el-pt-1">
        <button
          className="el-h-full el-w-full el-rounded el-p-3 el-flex el-flex-col el-items-center el-justify-center hover:el-bg-bg-200/50 el-text-center el-text-fg-400 el-text-sm"
          onClick={() =>
            openMenu({
              title: "Add package",
              viewId: modalViews.packageBrowser.id,
            })
          }
        >
          This project does not have any packages.
          <br />
          Click to add a package.
        </button>
      </div>
    );
  } else {
    content = (
      <ScrollArea
        scrollY
        containerClassName="el-h-full el-w-full el-space-y-2 el-p-2 el-pt-1"
      >
        {packages.map((pkg) => (
          <TreeEntry
            key={`${pkg.registry}:${pkg.name}`}
            icon={<Icon name={elllIcons16.package} />}
            suffix={
              <span className="el-text-sm el-text-fg-300">
                {pkg.version} @{pkg.registry}
              </span>
            }
            onClick={() => {
              handleOpenPackage(pkg);
            }}
          >
            {pkg.name}
          </TreeEntry>
        ))}
      </ScrollArea>
    );
  }

  return <>{content}</>;
}
