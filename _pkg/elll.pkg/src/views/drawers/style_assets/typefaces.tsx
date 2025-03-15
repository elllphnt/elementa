import { TypefaceData } from "@elllphnt/elll-element";
import { elllIcons16, Icon, TreeEntry, TreeIndent } from "@repo/components";
import { useElll } from "~/src/hooks/elll/elll";
import { useElllProject } from "~/src/hooks/project/project";
import { useProjectTypefaces } from "~/src/hooks/project/typefaces";
import { useWorkspaceState } from "~/src/hooks/shell/workspace";
import { fontVariantName } from "~/src/libs/fonts/font";
import { modalViews } from "../../modals/_";

export function TypefacesContent(): JSX.Element {
  const elll = useElll();
  const typefaces = useProjectTypefaces();

  if (!typefaces.length) {
    return (
      <div
        className="el-p-2 el-text-fg-300 hover:el-bg-fg/5 el-rounded el-cursor-pointer"
        onClick={() => {
          elll.shell.showModal({
            affinity: "workspace",
            viewId: modalViews.typefaces.id,
            closeOnBackdropClick: true,
            closeOnEscape: true,
          });
        }}
      >
        No typefaces yet. Click the here to open the typeface manager.
      </div>
    );
  } else {
    return (
      <div>
        {typefaces.map((typeface) => (
          <TypefaceEntry key={typeface.id} typeface={typeface} />
        ))}
      </div>
    );
  }
}

// New extracted component for typeface items with collapsible variants list.
function TypefaceEntry({ typeface }: { typeface: TypefaceData }): JSX.Element {
  const project = useElllProject();
  const [open, setOpen] = useWorkspaceState(
    ["typefaces", typeface.name || typeface.id || ""],
    false,
  );
  return (
    <>
      <TreeEntry
        nested
        container
        icon={<Icon name={elllIcons16.font} />}
        open={open}
        onToggleOpen={() => setOpen(!open)}
        onClick={() => {
          setOpen(!open);
        }}
      >
        {typeface.definition?.family}
      </TreeEntry>
      {open && (
        <TreeIndent>
          {typeface.variants?.length ? (
            typeface.variants.map((variant: string, idx: number) => (
              <TreeEntry
                key={idx}
                className="el-ml-4"
                actions={[
                  {
                    icon: <Icon name={elllIcons16.cross} />,
                    handler: () => {
                      if (typeface.id) {
                        project.styleManager.typefaceSheet.uninstallFonts(
                          typeface.id,
                          [variant],
                        );
                      }
                    },
                  },
                ]}
              >
                {fontVariantName(variant)}{" "}
                <span className="el-text-fg-300">({variant})</span>
              </TreeEntry>
            ))
          ) : (
            <div className="el-ml-4 el-text-fg-300">No variants selected.</div>
          )}
        </TreeIndent>
      )}
    </>
  );
}

export function Typefaces(): JSX.Element {
  const elll = useElll();
  const [open, setOpen] = useWorkspaceState("typefaces.open", false);

  return (
    <div>
      <TreeEntry
        nested
        container
        icon={<Icon name={elllIcons16.font} />}
        open={open}
        onToggleOpen={setOpen}
        onClick={() => {
          setOpen(!open);
        }}
        actions={[
          {
            icon: <Icon name={elllIcons16.search} />,
            handler: () => {
              elll.shell.showModal({
                affinity: "workspace",
                viewId: modalViews.typefaces.id,
                closeOnBackdropClick: true,
                closeOnEscape: true,
              });
            },
          },
        ]}
      >
        Typefaces
      </TreeEntry>
      {open && (
        <TreeIndent>
          <TypefacesContent />
        </TreeIndent>
      )}
    </div>
  );
}
