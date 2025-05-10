import { useObservable } from "@elllphnt/elementa-react-utils";
import { File } from "../../state/fs";
import { fileTypes } from "../../state/types";
import { AppEditor } from "./app_editor";
import { ComponentEditor } from "./component_editor";
import { TextEditor } from "./text_editor";

export function FileEditor({ file }: { file: File }) {
  const fileType = useObservable(file.type$, file.type);

  // Select the appropriate editor based on file type
  switch (fileType) {
    case fileTypes.component:
      return <ComponentEditor file={file} />;
    case fileTypes.app:
      return <AppEditor file={file} />;
    default:
      return <TextEditor file={file} />;
  }
}
