import { ViewComponent } from "@repo/components";
import { memo } from "react";
import { ModalCard } from "~/src/components/modals/modal_card";
import { AnchoredModalBox } from "~/src/components/modals/side_modal/anchored_modal_box";
import InlineSideModalProvider from "~/src/components/modals/side_modal/inline_side_modal_provider";
import ShellSideModalConsumer from "~/src/components/modals/side_modal/shell_side_modal_consumer";
import ShellSideModalProvider from "~/src/components/modals/side_modal/shell_side_modal_provider";
import SideModalContainer from "~/src/components/modals/side_modal/side_modal_container";
import { SideModalRenderer } from "~/src/components/modals/side_modal/side_modal_renderer";
import { useWorkspace } from "~/src/hooks/workspace";
import { useObservable } from "@repo/utils";
import { SideControlMenuContextProvider } from "./_providers/control_menu_context";

export const ActivityPanel = memo(function ActivityPanel(): JSX.Element {
  const workspace = useWorkspace();
  const activeActivityId = useObservable(
    workspace.state.value$("activeActivityId"),
    workspace.state.value("activeActivityId"),
  );
  const activeActivity = useObservable(
    workspace.activity$(activeActivityId || ""),
    workspace.activity(activeActivityId || ""),
  );

  if (!activeActivity) return <></>;

  return (
    <ShellSideModalProvider affinity="activity">
      <SideControlMenuContextProvider>
        <ViewComponent
          key={activeActivity.id}
          id={activeActivity.panel.viewId}
        />
      </SideControlMenuContextProvider>

      <SideModalRenderer>
        <InlineSideModalProvider>
          <SideModalContainer side="right" padding={8}>
            <ShellSideModalConsumer affinity="activity">
              <AnchoredModalBox axis="y" align="start">
                <SideControlMenuContextProvider>
                  <ModalCard />
                </SideControlMenuContextProvider>
              </AnchoredModalBox>
            </ShellSideModalConsumer>

            <SideModalRenderer>
              <SideModalContainer side="right" padding={8} flushCrossSide>
                <AnchoredModalBox axis="y" align="start">
                  <SideControlMenuContextProvider>
                    <ModalCard />
                  </SideControlMenuContextProvider>
                </AnchoredModalBox>
              </SideModalContainer>
            </SideModalRenderer>
          </SideModalContainer>
        </InlineSideModalProvider>
      </SideModalRenderer>
    </ShellSideModalProvider>
  );
});

export default ActivityPanel;
