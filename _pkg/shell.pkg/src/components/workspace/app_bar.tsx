import { LogoMini, ViewComponent } from "@repo/components";
import { useWorkspace } from "~/src/hooks/workspace";
import { ModalCard } from "../modals/modal_card";
import { AnchoredModalBox } from "../modals/side_modal/anchored_modal_box";
import ShellSideModalConsumer from "../modals/side_modal/shell_side_modal_consumer";
import ShellSideModalProvider from "../modals/side_modal/shell_side_modal_provider";
import SideModalContainer from "../modals/side_modal/side_modal_container";
import { SideModalRenderer } from "../modals/side_modal/side_modal_renderer";
import { SideControlMenuContextProvider } from "./panels/_providers/control_menu_context";

export function AppBar(): JSX.Element {
  const workspace = useWorkspace();
  const appBarViewId = workspace.viewMap.appBar;

  let content = (
    <div className="el-h-full el-w-full el-flex el-items-center">
      <div className="el-h-hull el-w-10 el-flex el-items-center el-justify-center">
        <LogoMini className="el-h-3 el-cursor-pointer" />
      </div>
    </div>
  );

  if (appBarViewId) {
    content = <ViewComponent key={appBarViewId} id={appBarViewId} />;
  }

  return (
    <ShellSideModalProvider affinity="appbar">
      <SideControlMenuContextProvider>{content}</SideControlMenuContextProvider>
      <SideModalRenderer>
        <SideModalContainer side="bottom" padding={8}>
          <ShellSideModalConsumer affinity="appbar">
            <AnchoredModalBox axis="x" align="center">
              <SideControlMenuContextProvider>
                <ModalCard />
              </SideControlMenuContextProvider>
            </AnchoredModalBox>
          </ShellSideModalConsumer>
        </SideModalContainer>
      </SideModalRenderer>
    </ShellSideModalProvider>
  );
}

export default AppBar;
