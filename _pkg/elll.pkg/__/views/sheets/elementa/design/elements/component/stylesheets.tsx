import {
  ControlButton,
  elllIcons16,
  FullControlEntry,
  Icon,
  mixed,
  useControlMenu,
} from "@repo/components";
import {
  CodeComponentElementHandle,
  CodeComponentStylesheetConfig,
  StylesheetEntity,
} from "@repo/elementa";
import { useManyObservables, useObservable } from "@repo/utils";
import { useInstancesCommonReactivePair } from "../../../../../../hooks/utils/reactivity";
import { modalViews } from "../../../../../modals/_";

function SingleStylsheetSummary({
  stylesheet,
}: {
  stylesheet: StylesheetEntity;
}): JSX.Element {
  const selectors = useObservable(stylesheet.selectors$, stylesheet.selectors);

  if (selectors.length === 0) {
    return <span>Empty</span>;
  }

  return (
    <span>
      {selectors.length} style{selectors.length === 1 ? "" : "s"}
    </span>
  );
}

function StylsheetsSummary({
  stylesheets,
}: {
  stylesheets: StylesheetEntity[];
}): JSX.Element {
  if (stylesheets.length === 0) {
    return <span>Empty</span>;
  }
  if (stylesheets.length === 1) {
    return <SingleStylsheetSummary stylesheet={stylesheets[0]} />;
  }
  return <span>Mixed</span>;
}

function StylesheetControlEntry({
  elements,
  name,
  config,
}: {
  elements: CodeComponentElementHandle[];
  name: string;
  config: CodeComponentStylesheetConfig;
}) {
  const { openMenu } = useControlMenu();
  const stylesheets = useManyObservables(
    elements.map((h) => h.entity.codeStylesheet$(name, true)),
    elements.map((h) => h.entity.codeStylesheet(name, true)),
    elements.map((h) => h.entity.key).join(","),
  );
  return (
    <FullControlEntry label={config.displayName ?? name}>
      <ControlButton
        prefix={<Icon name={elllIcons16.stylesheet} />}
        label={<StylsheetsSummary stylesheets={stylesheets} />}
        onClick={() => {
          openMenu({
            viewId: modalViews.stylesheetEditor.id,
            title: `${config.displayName ?? name} Stylesheet`,
            props: {
              stylesheets: stylesheets.map((s) => s.sheet),
            },
          });
        }}
      />
    </FullControlEntry>
  );
}

export function CodeStylesheetSheet({
  selection,
}: {
  selection: CodeComponentElementHandle[];
}): JSX.Element {
  const [_config$, _config] = useInstancesCommonReactivePair({
    instances: selection.map((h) => h.instance),
    value$: (i) => i.config$,
    value: (i) => i.config,
  });
  const configOrMixed = useObservable(_config$, _config);
  const isMixed = configOrMixed === mixed;
  const config = isMixed ? undefined : configOrMixed;
  const stylesheets = Object.entries(config?.stylesheets ?? {});

  let content = <></>;

  if (stylesheets.length) {
    content = (
      <>
        {stylesheets.map(([name, config]) => (
          <StylesheetControlEntry
            elements={selection}
            key={name}
            name={name}
            config={config}
          />
        ))}
      </>
    );
  } else if (isMixed) {
    content = (
      <div className="el-p-4 el-text-fg-500 el-text-center">
        Mixed components selected.
        <br /> Please select only one component to view its stylesheets.
      </div>
    );
  } else {
    content = <></>;
  }

  return <>{content}</>;
}
