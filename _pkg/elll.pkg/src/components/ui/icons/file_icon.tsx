import { elllFileTypes, switchFileType } from "@elllphnt/utils";
import { File } from "@repo/backend";
import { elllIcons16, Icon, IconProps } from "@repo/components";
import { useObservable } from "@repo/utils";
import cx from "classnames";
import { mimeTypes } from "~/src/libs/mimetypes";

export function fileIcon(type?: string) {
  if (!type) return elllIcons16.file;

  return switchFileType(
    type,
    {
      [elllFileTypes.component]: () => {
        return elllIcons16.component;
      },
      [elllFileTypes.primitive]: () => {
        return elllIcons16.primitive;
      },
      [elllFileTypes.context]: () => {
        return elllIcons16.context;
      },
      [elllFileTypes.hook]: () => {
        return elllIcons16.hook;
      },
      [elllFileTypes.routine]: () => {
        return elllIcons16.routine;
      },
      [mimeTypes.svg]: () => {
        return elllIcons16.vector;
      },
      [mimeTypes.png]: () => {
        return elllIcons16.image;
      },
      [mimeTypes.jpeg]: () => {
        return elllIcons16.image;
      },
      [mimeTypes.gif]: () => {
        return elllIcons16.image;
      },
      [mimeTypes.json]: () => {
        return elllIcons16.json;
      },
    },
    () => {
      return elllIcons16.file;
    },
  );
}

export function fileColor(type?: string) {
  return "";
}

export function fileIconClassName(type?: string) {
  if (!type) return "el-text-gray";

  return switchFileType(
    type,
    {
      [elllFileTypes.component]: () => {
        // Components are visual and structural → orange = vibrant and foundational
        return "el-text-orange";
      },
      [elllFileTypes.primitive]: () => {
        // Primitives are low-level building blocks → blue = calm, trustworthy
        return "el-text-blue";
      },
      [elllFileTypes.hook]: () => {
        // Hooks deal with state/logic → violet = cerebral, abstract
        return "el-text-violet";
      },
      [elllFileTypes.routine]: () => {
        // Routines are procedural logic → red = dynamic, action-oriented
        return "el-text-red";
      },
      [elllFileTypes.context]: () => {
        // Context shares state app-wide → pink = connective, friendly
        return "el-text-pink";
      },
      [mimeTypes.json]: () => {
        // Config/data → green = structured, natural
        return "el-text-green";
      },
      [mimeTypes.svg]: () => {
        // Vectors → cyan = clean, graphical
        return "el-text-cyan";
      },
      [mimeTypes.png]: () => {
        // Raster images → cyan = consistent with visuals
        return "el-text-cyan";
      },
      [mimeTypes.jpeg]: () => {
        return "el-text-cyan";
      },
      [mimeTypes.gif]: () => {
        // Animated or playful → rose = expressive
        return "el-text-rose";
      },
    },
    () => {
      // Unknown type → neutral gray
      return "el-text-gray";
    },
  );
}

export function FileIcon({
  file,
  type,
  open,
  className,
  ...props
}: { file?: File; type?: string; open?: boolean } & IconProps): JSX.Element {
  const _type = useObservable(file?.type$, file?.type) ?? type;

  let name: string;
  let fileClassName = "";

  if (_type === "directory") {
    if (open) {
      name = elllIcons16.directoryOpen;
    } else {
      name = elllIcons16.directoryClosed;
    }
  } else {
    name = fileIcon(_type);
    fileClassName = fileIconClassName(_type);
  }

  return (
    <Icon
      key={_type}
      name={name}
      className={cx(fileClassName, className)}
      {...props}
    />
  );
}

export default FileIcon;
