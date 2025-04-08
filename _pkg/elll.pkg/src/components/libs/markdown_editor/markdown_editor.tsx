import { ControlProps, useControlValue } from "@repo/components";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { Markdown } from "tiptap-markdown";

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Type here...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({
        html: true,
        tightLists: true,
        tightListClass: "tight",
        bulletListMarker: "-",
        linkify: false,
        transformPastedText: false,
        transformCopiedText: false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    // Pass the markdown input directly. The Markdown extension handles conversion.
    content: value,
    onUpdate({ editor }) {
      // Assuming the Markdown extension adds a `getMarkdown` method.
      onChange(editor.storage.markdown.getMarkdown());
    },
    editorProps: {
      attributes: {
        class: "el-outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && editor.storage.markdown.getMarkdown() !== value) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  return <EditorContent editor={editor} />;
}

export function MarkdownEditorControl({
  value$,
  value,
  onChange,
  settings,
}: ControlProps<
  string,
  {
    placeholder?: string;
  }
>) {
  const currentValue = useControlValue(value$, value) as string | undefined;

  return (
    <div className="">
      <MarkdownEditor
        value={currentValue || ""}
        onChange={(value) => {
          onChange?.(value);
        }}
        placeholder={settings?.placeholder}
      />
    </div>
  );
}
