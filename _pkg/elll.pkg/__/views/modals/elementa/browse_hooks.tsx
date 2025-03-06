import { elllFileTypes, makeFidUrl } from "@elllphnt/utils";
import { File } from "@repo/backend";
import { HookData, entityTypes } from "@repo/elementa";
import { drawerViews } from "../../drawers/_";

export function BrowseHooksView({
  onHook,
}: {
  onHook?: (state: HookData) => void;
}): JSX.Element {
  return (
    <ModalContainer title="Browse Hooks" height={320} width={280}>
      <TabContainer
        stateKey={["hooks", "tabs"]}
        tabs={[
          {
            key: "hooks",
            name: "Hooks",
            viewId: drawerViews.hooks.id,
          },
        ]}
        props={{
          handleClick: (file: File, index?: File) => {
            if (file.type === elllFileTypes.state) {
              onHook?.({
                type: entityTypes.hook,
                name: file.name,
                moduleUrl: makeFidUrl({
                  id: file.fid,
                }),
              });
            }
          },
        }}
        hr
        containerClassName="el-pt-1"
      />
    </ModalContainer>
  );
}
