import { elllIcons16, Icon, TreeEntry } from "@repo/components";
import cx from "classnames";
import { useState } from "react";

export function CopyControl({
  value,
  label,
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    window.navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }
  return (
    <TreeEntry
      noIcon
      className={cx("el-text-fg-500 el-border", className)}
      actions={[
        {
          icon: <Icon name={(elllIcons16 as any).copy} />,
          handler: handleCopy,
        },
      ]}
      onClick={handleCopy}
    >
      {copied ? "Copied to clipboard!" : label || value}
    </TreeEntry>
  );
}
