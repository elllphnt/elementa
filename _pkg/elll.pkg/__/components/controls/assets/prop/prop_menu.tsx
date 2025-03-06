import { ViewComponent } from "@repo/components";
import { Prop } from "@repo/elementa";
import { modalViews } from "../../../../views/modals/_";

export function PropMenu({ prop, indent }: { prop: Prop; indent?: boolean }) {
  return (
    <>
      <ViewComponent
        id={modalViews.componentProps.id}
        props={{
          prop,
        }}
      />
    </>
  );
}
