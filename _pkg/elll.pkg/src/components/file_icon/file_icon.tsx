import { elllFileTypes, switchFileType } from "@elllphnt/utils";
import { File } from "@repo/backend";
import { elllIcons16, Icon, IconProps } from "@repo/components";
import { useObservable } from "@repo/utils";

export function fileIcon(type?: string) {
  if (!type) return elllIcons16.file;

  return switchFileType(
    type,
    {
      [elllFileTypes.component]: () => {
        return elllIcons16.component;
      },
      [elllFileTypes.components.react]: () => {
        return elllIcons16.component;
      },
      [elllFileTypes.state]: () => {
        return elllIcons16.state;
      },
      // [mimeTypes.svg]: () => {
      //   return elllIcons16.vector;
      // },
      // [mimeTypes.png]: () => {
      //   return elllIcons16.image;
      // },
      // [mimeTypes.jpeg]: () => {
      //   return elllIcons16.image;
      // },
      // [mimeTypes.gif]: () => {
      //   return elllIcons16.image;
      // },
      // [mimeTypes.pdf]: () => {
      //   return elllIcons16.template;
      // },
    },
    () => {
      return elllIcons16.file;
    },
  );
}

export function fileColor(type?: string) {
  if (!type) return "#888888";

  return switchFileType(
    type,
    {
      [elllFileTypes.components.elll]: () => {
        return "#ff8800";
      },
      [elllFileTypes.components.react]: () => {
        return "#0088ff";
      },
      [elllFileTypes.state]: () => {
        return "#8888ff";
      },
    },
    () => {
      return "currentColor";
    },
  );
}

export function FileIcon({
  file,
  type,
  open,
  ...props
}: { file?: File; type?: string; open?: boolean } & IconProps): JSX.Element {
  const _type = useObservable(file?.type$, file?.type) ?? type;

  let color: string;
  let name: string;

  if (_type === "directory") {
    color = "currentColor";
    if (open) {
      name = elllIcons16.directoryOpen;
    } else {
      name = elllIcons16.directoryClosed;
    }
  } else {
    color = fileColor(_type);
    name = fileIcon(_type);
  }

  return <Icon key={_type} color={color} name={name} {...props} />;
}

export default FileIcon;
