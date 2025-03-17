import { elllIcons16 } from "../icons/elll_icons";
import Icon from "../icons/icon";
import View from "../view/view";
import { ControlMenu } from "./_types";

export function ControlMenuContent({
  menu,
  onBack,
  onClose,
}: {
  menu: ControlMenu;
  onBack?: () => void;
  onClose: () => void;
}): JSX.Element {
  let content = <View id={menu.viewId} props={menu.props} />;

  return (
    <div
      className="el-text-sm"
      style={{
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minWidth: 240,
      }}
    >
      <div
        className="el-flex el-items-center el-px-3 el-py-2 el-pr-2"
        style={{
          gap: 8,
          width: "100%",
        }}
      >
        {onBack ? (
          <button
            className="el-h-5 el-w-5 el-shrink-0 hover:el-bg-fg/5 el-rounded el-flex el-items-center el-justify-center el-text-fg-300 hover:el-text-fg"
            onClick={onBack}
          >
            <Icon
              className="el-h-4 el-w-4"
              name={elllIcons16.chevron}
              style={{
                transform: "rotate(180deg)",
              }}
            />
          </button>
        ) : (
          <></>
        )}

        <div
          className="el-grow el-font-semibold"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {menu.title}
        </div>
        <button
          className="el-h-5 el-w-5 el-shrink-0 hover:el-bg-fg/5 el-rounded el-flex el-items-center el-justify-center el-text-fg-300 hover:el-text-fg"
          onClick={onClose}
        >
          <Icon className="el-h-4 el-w-4" name={elllIcons16.cross} />
        </button>
      </div>

      <hr />

      <div>{content}</div>
    </div>
  );
}
