import { elllIcons20, Icon } from "@repo/components";
import {
  alignHandles,
  distributeHandles,
  Handle,
} from "@repo/elementa-interactor";
import { PropsWithChildren } from "react";

function IconButton({
  onClick,
  children,
}: PropsWithChildren<{
  onClick: () => void;
}>): JSX.Element {
  return (
    <button
      className="flex el-items-center el-justify-center el-rounded el-h-5 el-w-5 el-text-fg hover:el-text-fg-500"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function RenderableAlignControlSheet({
  selection,
}: {
  selection: Handle[];
}): JSX.Element {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <IconButton
          onClick={() => {
            alignHandles(selection, "left");
          }}
        >
          <Icon name={elllIcons20.alignXStart} className="el-h-5 el-w-5" />
        </IconButton>
        <IconButton
          onClick={() => {
            alignHandles(selection, "h-center");
          }}
        >
          <Icon name={elllIcons20.alignXCenter} className="el-h-5 el-w-5" />
        </IconButton>
        <IconButton
          onClick={() => {
            alignHandles(selection, "right");
          }}
        >
          <Icon name={elllIcons20.alignXEnd} className="el-h-5 el-w-5" />
        </IconButton>
        <IconButton
          onClick={() => {
            alignHandles(selection, "top");
          }}
        >
          <Icon name={elllIcons20.alignYStart} className="el-h-5 el-w-5" />
        </IconButton>
        <IconButton
          onClick={() => {
            alignHandles(selection, "v-center");
          }}
        >
          <Icon name={elllIcons20.alignYCenter} className="el-h-5 el-w-5" />
        </IconButton>
        <IconButton
          onClick={() => {
            alignHandles(selection, "bottom");
          }}
        >
          <Icon name={elllIcons20.alignYEnd} className="el-h-5 el-w-5" />
        </IconButton>

        <IconButton
          onClick={() => {
            distributeHandles(selection, "x");
          }}
        >
          <Icon name={elllIcons20.distributeX} className="el-h-5 el-w-5" />
        </IconButton>
        <IconButton
          onClick={() => {
            distributeHandles(selection, "y");
          }}
        >
          <Icon name={elllIcons20.distributeY} className="el-h-5 el-w-5" />
        </IconButton>
      </div>
    </>
  );
}
