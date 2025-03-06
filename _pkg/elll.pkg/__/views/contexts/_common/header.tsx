import { elllIcons16, Icon } from "@repo/components";

export function ContextPanelHeader({
  icon,
  title,
  onBack,
}: {
  icon?: string;
  title: string;
  onBack?: () => void;
}) {
  return (
    <div className="el-p-2 el-shrink-0 el-bg-pm/10 el-border-b el-border-pm/20 el-flex el-items-center el-gap-2">
      {onBack ? (
        <button
          onClick={onBack}
          className="el-h-6 el-w-6 el-rounded hover:el-bg-pm/20 el-flex el-items-center el-justify-center"
        >
          <Icon name={elllIcons16.chevron} className="el-rotate-180" />
        </button>
      ) : (
        <></>
      )}
      <div className="el-flex el-gap-1 el-items-center">
        {icon ? <Icon name={icon} /> : null} <div>{title}</div>
      </div>
    </div>
  );
}
