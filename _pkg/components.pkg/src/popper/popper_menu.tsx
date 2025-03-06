import { PopperMenuOption, PopperMenuOptionProps } from "./popper_menu_option";

export function PopperMenu({ options }: { options: PopperMenuOptionProps[] }) {
  return (
    <div className="el-p-1 el-rounded el-w-full el-space-y-1">
      {options.map((option, index) => (
        <PopperMenuOption key={index} {...option} />
      ))}
    </div>
  );
}
