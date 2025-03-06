import {
  BaseControlType,
  ControlEntryVariant,
  elllIcons16,
  fractionUnits,
  Icon,
  lengthKeywords,
  lengthUnits,
  percentUnits,
  RowControlContainer,
  useAction,
} from "@repo/components";
import { ElementInstance } from "@repo/elementa";
import { cornerControlViews } from "../../../../../../components/controls/datatypes/corner/_";
import { paddingControlViews } from "../../../../../../components/controls/datatypes/padding/_views";
import { InstanceStyleControlEntry } from "../../../../../../components/controls/infrastructure/style/instance_style";
import { useElementStyles } from "../../../../../../hooks/elementa/element";
import { useElementPropertyState } from "../../../../../../hooks/elementa/style";

export function ElementSizeControlSheet({
  instances,
}: {
  instances: ElementInstance[];
}): JSX.Element {
  const styles = useElementStyles(instances);

  const [showMinSize, setShowMinSize] = useElementPropertyState([
    "size",
    "min",
  ]);

  const [showMaxSize, setShowMaxSize] = useElementPropertyState([
    "size",
    "max",
  ]);
  const [showAspect, setShowAspect] = useElementPropertyState([
    "size",
    "aspect",
  ]);
  const [showPadding, setShowPadding] = useElementPropertyState([
    "size",
    "padding",
  ]);

  const [showCorner, setShowCorner] = useElementPropertyState([
    "size",
    "corner",
  ]);

  const [showOverflow, setShowOverflow] = useElementPropertyState([
    "size",
    "overflow",
  ]);

  useAction(
    {
      index: 0,
      title: "Min Size",
      icon: elllIcons16.minSize,
      active: !!showMinSize,
      handler: () => {
        setShowMinSize(!showMinSize);
      },
    },
    [showMinSize, setShowMinSize],
  );
  useAction(
    {
      index: 1,
      title: "Max Size",
      active: !!showMaxSize,
      icon: elllIcons16.maxSize,
      handler: () => {
        setShowMaxSize(!showMaxSize);
      },
    },
    [showMaxSize, setShowMaxSize],
  );
  useAction(
    {
      index: 2,
      title: "Aspect Ratio",
      active: !!showAspect,
      icon: elllIcons16.aspectRatio,
      handler: () => {
        setShowAspect(!showAspect);
      },
    },
    [showAspect, setShowAspect],
  );

  useAction(
    {
      index: 3,
      title: "Padding",
      active: !!showPadding,
      icon: elllIcons16.inset,
      handler: () => {
        setShowPadding(!showPadding);
      },
    },
    [showPadding, setShowPadding],
  );

  useAction(
    {
      index: 4,
      title: "Corner",
      active: !!showCorner,
      icon: elllIcons16.corner,
      handler: () => {
        setShowCorner(!showCorner);
      },
    },
    [showCorner, setShowCorner],
  );

  useAction(
    {
      index: 5,
      title: "Overflow",
      active: !!showOverflow,
      icon: elllIcons16.xyOverflow,
      handler: () => {
        setShowOverflow(!showOverflow);
      },
    },
    [showOverflow, setShowOverflow],
  );

  return (
    <>
      <RowControlContainer>
        <InstanceStyleControlEntry
          variant={ControlEntryVariant.Mini}
          property="width"
          name="Width"
          styles={styles}
          control={BaseControlType.Dimension}
          controlSettings={{
            units: [...lengthUnits, ...percentUnits, ...fractionUnits],
            keywords: [...lengthKeywords],
            defaultUnit: "px",
          }}
        />
        <InstanceStyleControlEntry
          variant={ControlEntryVariant.Mini}
          property="height"
          name="Height"
          styles={styles}
          control={BaseControlType.Dimension}
          controlSettings={{
            units: [...lengthUnits, ...percentUnits, ...fractionUnits],
            keywords: [...lengthKeywords],
            defaultUnit: "px",
          }}
        />
      </RowControlContainer>

      {showMinSize && (
        <RowControlContainer>
          <InstanceStyleControlEntry
            variant={ControlEntryVariant.Mini}
            property="min-width"
            name="Min Width"
            icon={<Icon name={elllIcons16.minSize} />}
            styles={styles}
            control={BaseControlType.Dimension}
            controlSettings={{
              units: [...lengthUnits, ...percentUnits],
              defaultUnit: "px",
            }}
          />
          <InstanceStyleControlEntry
            variant={ControlEntryVariant.Mini}
            property="min-height"
            name="Min Height"
            icon={
              <Icon
                name={elllIcons16.minSize}
                style={{
                  transform: "rotate(90deg)",
                }}
              />
            }
            styles={styles}
            control={BaseControlType.Dimension}
            controlSettings={{
              units: [...lengthUnits, ...percentUnits],
              defaultUnit: "px",
            }}
          />
        </RowControlContainer>
      )}

      {showMaxSize && (
        <RowControlContainer>
          <InstanceStyleControlEntry
            variant={ControlEntryVariant.Mini}
            property="max-width"
            name="Max Width"
            icon={<Icon name={elllIcons16.maxSize} />}
            styles={styles}
            control={BaseControlType.Dimension}
            controlSettings={{
              units: [...lengthUnits, ...percentUnits],
              defaultUnit: "px",
            }}
          />
          <InstanceStyleControlEntry
            variant={ControlEntryVariant.Mini}
            property="max-height"
            name="Max Height"
            icon={
              <Icon
                name={elllIcons16.maxSize}
                style={{
                  transform: "rotate(90deg)",
                }}
              />
            }
            styles={styles}
            control={BaseControlType.Dimension}
            controlSettings={{
              units: [...lengthUnits, ...percentUnits],
              defaultUnit: "px",
            }}
          />
        </RowControlContainer>
      )}

      <RowControlContainer>
        {showCorner ? (
          <InstanceStyleControlEntry
            variant={ControlEntryVariant.Mini}
            properties={[
              "border-top-left-radius",
              "border-top-right-radius",
              "border-bottom-left-radius",
              "border-bottom-right-radius",
            ]}
            name="Corner"
            icon={<Icon name={elllIcons16.corner} />}
            styles={styles}
            control={BaseControlType.Length}
            controlSettings={{
              min: 0,
              step: 1,
            }}
            menus={[
              {
                key: "corners",
                title: "Corners",
                viewId: cornerControlViews.menu.id,
              },
            ]}
          />
        ) : (
          <></>
        )}

        {showAspect ? (
          <InstanceStyleControlEntry
            variant={ControlEntryVariant.Mini}
            property="aspect-ratio"
            name="Aspect Ratio"
            icon={<Icon name={elllIcons16.aspectRatio} />}
            styles={styles}
            control={BaseControlType.Number}
            controlSettings={{
              min: 0,
              step: 0.1,
            }}
          />
        ) : (
          <></>
        )}
      </RowControlContainer>

      {showPadding ? (
        <InstanceStyleControlEntry
          properties={[
            "padding-top",
            "padding-right",
            "padding-bottom",
            "padding-left",
          ]}
          name="Padding"
          icon={<Icon name={elllIcons16.inset} />}
          styles={styles}
          control={BaseControlType.Number}
          controlSettings={{
            step: 1,
          }}
          menus={[
            {
              key: "padding",
              title: "Padding",
              viewId: paddingControlViews.menu.id,
            },
          ]}
        />
      ) : (
        <></>
      )}

      {showOverflow ? (
        <>
          <InstanceStyleControlEntry
            property="overflow"
            name="Overflow"
            icon={<Icon name={elllIcons16.xyOverflow} />}
            styles={styles}
            control={BaseControlType.Select}
            controlSettings={{
              options: [
                { value: "visible", label: "Visible" },
                { value: "hidden", label: "Hidden" },
                { value: "scroll-x", label: "Scroll Vertical" },
                { value: "scroll-y", label: "Scroll Horizontal" },
                { value: "scroll-area", label: "Scroll Area" },
              ],
            }}
          />
        </>
      ) : (
        <></>
      )}
    </>
  );
}
