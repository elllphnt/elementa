import {
  ColumnControlContainer,
  elllIcons16,
  FullControlEntry,
  Icon,
  SelectControl,
  TextControl,
  TreeEntry,
} from "@repo/components";
import {
  ElementConnectionHandle,
  elementConnectionTypes,
  entityTypeMatch,
  entityTypes,
  useElementaEditor,
} from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { useEffect, useRef } from "react";

function StyleMenu({ handle }: { handle: ElementConnectionHandle }) {
  return (
    <>
      <FullControlEntry label="Property">
        <TextControl
          value={handle.connection.setting("property")}
          value$={handle.connection.setting$("property")}
          onChange={(value) => {
            handle.connection.setSetting("property", value);
          }}
        />
      </FullControlEntry>
    </>
  );
}
function InteractionMenu({ handle }: { handle: ElementConnectionHandle }) {
  return (
    <>
      <FullControlEntry label="Event">
        <SelectControl
          value={handle.connection.setting("event")}
          value$={handle.connection.setting$("event")}
          onChange={(value) => {
            handle.connection.setSetting("event", value);
          }}
          settings={{
            options: [
              { label: "Click", value: "click" },
              { label: "Mouse Down", value: "mousedown" },
              { label: "Mouse Up", value: "mouseup" },
              { label: "Mouse Enter", value: "mouseenter" },
              { label: "Mouse Leave", value: "mouseleave" },
            ],
          }}
        />
      </FullControlEntry>
    </>
  );
}
function PropMenu({ handle }: { handle: ElementConnectionHandle }) {
  return (
    <>
      <FullControlEntry label="Prop">
        <TextControl
          value={handle.connection.setting("prop")}
          value$={handle.connection.setting$("prop")}
          onChange={(value) => {
            handle.connection.setSetting("prop", value);
          }}
        />
      </FullControlEntry>
    </>
  );
}

const connectionTypeConfigs: Record<
  string,
  {
    allowedElementTypes: string[];
    label: string;
    icon: string;
    menu?: (props: { handle: ElementConnectionHandle }) => JSX.Element;
  }
> = {
  [elementConnectionTypes.link]: {
    allowedElementTypes: [entityTypes.element],
    label: "Link",
    icon: elllIcons16.direction,
  },
  [elementConnectionTypes.style]: {
    allowedElementTypes: [entityTypes.element],
    label: "Style",
    icon: elllIcons16.stylesheet,
    menu: StyleMenu,
  },
  [elementConnectionTypes.interaction]: {
    allowedElementTypes: [entityTypes.element],
    label: "Interaction",
    icon: elllIcons16.interaction,
    menu: InteractionMenu,
  },

  // container
  [elementConnectionTypes.container.content]: {
    allowedElementTypes: [entityTypes.elements.container],
    label: "Content",
    icon: elllIcons16.container,
  },

  // text
  [elementConnectionTypes.text.content]: {
    allowedElementTypes: [entityTypes.elements.text],
    label: "Content",
    icon: elllIcons16.text,
  },

  // media
  [elementConnectionTypes.media.content]: {
    allowedElementTypes: [entityTypes.elements.media],
    label: "Content",
    icon: elllIcons16.image,
  },

  // vector
  [elementConnectionTypes.vector.content]: {
    allowedElementTypes: [entityTypes.elements.vector],
    label: "Content",
    icon: elllIcons16.vector,
  },

  // component
  [elementConnectionTypes.component.props]: {
    allowedElementTypes: [entityTypes.elements.component],
    label: "Prop",
    icon: elllIcons16.model,
    menu: PropMenu,
  },
};

function InitialConnectionMenu({
  handle,
  typeOptions,
}: {
  handle: ElementConnectionHandle;
  typeOptions: { label: string; value: string; icon: string }[];
}) {
  return (
    <ColumnControlContainer>
      {typeOptions.map(({ label, value, icon }) => (
        <TreeEntry
          key={value}
          icon={<Icon name={icon} />}
          onClick={() => {
            handle.connection.setType(value);
          }}
        >
          {label}
        </TreeEntry>
      ))}
    </ColumnControlContainer>
  );
}

export function ElementConnectionMenu({
  handle,
}: {
  handle: ElementConnectionHandle;
}) {
  const connection = handle.connection;
  const type = useObservable(connection.type$, connection.type);
  const typeOptions = Object.entries(connectionTypeConfigs)
    .filter(([, config]) => {
      return config.allowedElementTypes.some((allowedType) =>
        entityTypeMatch(connection.element.type, allowedType),
      );
    })
    .map(([type, config]) => {
      return {
        label: config.label,
        value: type,
        icon: config.icon,
      };
    });

  if (!type) {
    return <InitialConnectionMenu handle={handle} typeOptions={typeOptions} />;
  }

  const config = connectionTypeConfigs[type];
  const Menu = config.menu;

  return (
    <ColumnControlContainer>
      <FullControlEntry label="Type">
        <SelectControl
          value={type}
          onChange={(value) => {
            connection.setType(value);
          }}
          settings={{
            options: typeOptions,
          }}
        />
      </FullControlEntry>

      {Menu ? <Menu handle={handle} /> : <></>}
    </ColumnControlContainer>
  );
}
export function ElementConnectionMenuContainer({
  connection,
}: {
  connection: ElementConnectionHandle;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const editor = useElementaEditor();

  useEffect(() => {
    const htmlElement = ref.current;
    if (!htmlElement) return;

    const subscription = connection.viewportRect$.subscribe((rect) => {
      const center = rect?.center;
      if (!center) return;

      htmlElement.style.left = `${center.x}px`;
      htmlElement.style.top = `${center.y}px`;
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [connection]);

  // prevent default browser zoom
  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      editor.viewport.handleWheel(event);
    };

    const element = ref.current;
    if (!element) return;

    element.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      element.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 240,
        pointerEvents: "auto",
      }}
      className="el-bg-bg el-rounded-md el-shadow-md"
    >
      <div className="el-p-3 el-font-semibold">Connection</div>
      <hr />
      <ElementConnectionMenu handle={connection} />
    </div>
  );
}

export function FloatingMenu() {
  const editor = useElementaEditor();
  const selection = useObservable(
    editor.interactionManager.selection$,
    editor.interactionManager.selection,
  );

  if (
    selection.length === 1 &&
    selection[0].entity.type === "element-connection"
  ) {
    return (
      <ElementConnectionMenuContainer
        connection={selection[0] as ElementConnectionHandle}
      />
    );
  } else {
    return <>{selection.length}</>;
  }
}
