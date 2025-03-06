import {
  BaseControlType,
  ControlEntryVariant,
  elllIcons16,
  Icon,
  RowControlContainer,
  useAction,
} from "@repo/components";
import { InstanceStyle } from "@repo/elementa/dist/elementa/style/style";
import { InstanceStyleControlEntry } from "../../../../../components/controls/infrastructure/style/instance_style";
import {
  useElementPropertyState,
  useStylesCommonPropertyValue,
} from "../../../../../hooks/elementa/style";

function StackControls({ styles }: { styles: InstanceStyle[] }): JSX.Element {
  const [showGap, setShowGap] = useElementPropertyState(["layout", "gap"]);
  const [showWrap, setShowWrap] = useElementPropertyState(["layout", "wrap"]);

  useAction(
    {
      index: 0,
      title: "Gap",
      active: !!showGap,
      icon: elllIcons16.gap,
      handler: () => {
        setShowGap(!showGap);
      },
    },
    [showGap, setShowGap],
  );

  useAction(
    {
      index: 1,
      title: "Wrap",
      active: !!showWrap,
      icon: elllIcons16.wrap,
      handler: () => {
        setShowWrap(!showWrap);
      },
    },
    [showWrap, setShowWrap],
  );

  return (
    <>
      <InstanceStyleControlEntry
        name="Direction"
        property="flex-direction"
        styles={styles}
        control={BaseControlType.Switch}
        controlSettings={{
          options: [
            {
              value: "row",
              label: <Icon name={elllIcons16.row} className="el-h-4 el-w-4" />,
            },
            {
              value: "column",
              label: (
                <Icon name={elllIcons16.column} className="el-h-4 el-w-4" />
              ),
            },
          ],
        }}
      />
      <InstanceStyleControlEntry
        name="Align"
        property="align-items"
        styles={styles}
        control={BaseControlType.Switch}
        controlSettings={{
          options: [
            {
              value: "start",
              label: "s",
            },
            {
              value: "center",
              label: "c",
            },
            {
              value: "end",
              label: "e",
            },
          ],
        }}
      />
      <InstanceStyleControlEntry
        name="Justify"
        property="justify-content"
        styles={styles}
        control={BaseControlType.Switch}
        controlSettings={{
          options: [
            {
              value: "start",
              label: "s",
            },
            {
              value: "center",
              label: "c",
            },
            {
              value: "end",
              label: "e",
            },
          ],
        }}
      />
      <RowControlContainer>
        {showWrap ? (
          <InstanceStyleControlEntry
            name="Wrap"
            variant={ControlEntryVariant.Mini}
            property="flex-wrap"
            styles={styles}
            icon={<Icon name={elllIcons16.wrap} />}
            control={BaseControlType.Switch}
            controlSettings={{
              options: [
                { value: "nowrap", label: "Off" },
                { value: "wrap", label: "On" },
              ],
            }}
          />
        ) : (
          <></>
        )}
        {showGap ? (
          <InstanceStyleControlEntry
            name="Gap"
            variant={ControlEntryVariant.Mini}
            properties={["gap-x", "gap-y"]}
            styles={styles}
            icon={<Icon name={elllIcons16.gap} />}
            control={BaseControlType.Length}
            controlSettings={{
              min: 0,
            }}
          />
        ) : (
          <></>
        )}
      </RowControlContainer>
    </>
  );
}
function GridControls({ styles }: { styles: InstanceStyle[] }): JSX.Element {
  const [showGap, setShowGap] = useElementPropertyState(["layout", "gap"]);
  const [showWrap, setShowWrap] = useElementPropertyState(["layout", "wrap"]);

  useAction(
    {
      index: 0,
      title: "Gap",
      active: !!showGap,
      icon: elllIcons16.gap,
      handler: () => {
        setShowGap(!showGap);
      },
    },
    [showGap, setShowGap],
  );

  useAction(
    {
      index: 1,
      title: "Wrap",
      active: !!showWrap,
      icon: elllIcons16.wrap,
      handler: () => {
        setShowWrap(!showWrap);
      },
    },
    [showWrap, setShowWrap],
  );

  return (
    <>
      <RowControlContainer>
        <InstanceStyleControlEntry
          name="Rows"
          variant={ControlEntryVariant.Mini}
          icon={<Icon name={elllIcons16.column} />}
          property="grid-template-rows"
          styles={styles}
          control={BaseControlType.Number}
        />
        <InstanceStyleControlEntry
          name="Columns"
          variant={ControlEntryVariant.Mini}
          icon={<Icon name={elllIcons16.row} />}
          property="grid-template-columns"
          styles={styles}
          control={BaseControlType.Number}
        />
      </RowControlContainer>

      <RowControlContainer>
        <InstanceStyleControlEntry
          name="Row Gap"
          variant={ControlEntryVariant.Mini}
          property="gap-y"
          styles={styles}
          icon={<Icon name={elllIcons16.gap} className="el-rotate-90" />}
          control={BaseControlType.Number}
          controlSettings={{
            min: 0,
          }}
        />
        <InstanceStyleControlEntry
          name="Column Gap"
          variant={ControlEntryVariant.Mini}
          property="gap-x"
          styles={styles}
          icon={<Icon name={elllIcons16.gap} />}
          control={BaseControlType.Number}
          controlSettings={{
            min: 0,
          }}
        />
      </RowControlContainer>
    </>
  );
}
export function LayoutControls({
  styles,
}: {
  styles: InstanceStyle[];
}): JSX.Element {
  const layout = useStylesCommonPropertyValue(styles, "display");

  return (
    <>
      <InstanceStyleControlEntry
        name="Layout"
        property="display"
        styles={styles}
        control={BaseControlType.Select}
        controlSettings={{
          options: [
            { value: "flex", label: "Stack" },
            { value: "grid", label: "Grid" },
          ],
        }}
      />

      {layout === "flex" ? <StackControls styles={styles} /> : <></>}
      {layout === "grid" ? <GridControls styles={styles} /> : <></>}
    </>
  );
}
