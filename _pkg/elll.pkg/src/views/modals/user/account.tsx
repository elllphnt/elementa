import { ControlMenuContainer, elllIcons16, Icon } from "@repo/components";
import { useObservable } from "@repo/utils";
import { useElll } from "~/src/hooks/elll/elll";

export function AccountModal() {
  const elll = useElll();
  const user = useObservable(elll.user$, elll.user);
  const name = useObservable(user?.name$, user?.name);
  const email = useObservable(user?.email$, user?.email);
  const picture = useObservable(user?.picture$, user?.picture);

  return (
    <ControlMenuContainer
      className="el-h-full el-w-full el-space-y-3"
      style={{
        width: 240,
      }}
    >
      <div className="el-flex el-items-center el-gap-2">
        <div className="el-relative el-w-8 el-aspect-square el-rounded-md el-bg-bg-200 el-flex el-items-center el-justify-center el-text-fg-400 el-overflow-hidden">
          <Icon name={elllIcons16.activityUser} className="el-w-5 el-h-5" />
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${user?.picture})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>
        <div>
          <p>{name}</p>
          <p className="el-text-fg-300">{email}</p>
        </div>
      </div>
      <button
        onClick={() => elll.host.logout()}
        className="el-w-full el-bg-fg/5 el-text-fg hover:el-bg-fg/10 el-rounded el-px-2 el-py-1"
      >
        Log out
      </button>
    </ControlMenuContainer>
  );
}
