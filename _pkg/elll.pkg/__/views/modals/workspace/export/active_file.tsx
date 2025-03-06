import {
  ColumnControlContainer,
  elllIcons16,
  Icon,
  TreeEntry,
} from "@repo/components";
import { useObservable } from "@repo/utils";
import { useState } from "react";
import { ContentEditorState } from "~/src/editors/content";

export function ContentEditorExportMenu({
  editor,
}: {
  editor: ContentEditorState;
}) {
  const url = useObservable(editor.url$, editor.url);
  const [copied, setCopied] = useState(false);
  const command = `npx elll add ${url}`;

  function handleCopy() {
    window.navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }
  return (
    <div
      style={{
        width: 300,
      }}
      className="el-space-y-3"
    >
      <ColumnControlContainer noPadding>
        <p>
          Install this component in your project by running the following
          command:
        </p>
        <TreeEntry
          noIcon
          className="el-border el-font-mono"
          actions={[
            {
              icon: <Icon name={elllIcons16.copy} />,
              handler: handleCopy,
            },
          ]}
          onClick={handleCopy}
        >
          {copied ? "Copied to clipboard!" : command}
        </TreeEntry>
      </ColumnControlContainer>
    </div>
  );
}
