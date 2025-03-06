import {
  ColumnControlContainer,
  elllIcons16,
  InlineExpressionControl,
  useAction,
  ViewComponent,
} from "@repo/components";
import {
  EvaluableMap,
  isExpression,
  Style,
  StyleData,
  stylePropertyConfigMap,
  StylePropertyName,
  Theme,
} from "@repo/elementa";
import { useState } from "react";
import { useCommonReactivePair } from "../../../../../hooks/utils/reactivity";
import { InlineVariableControl } from "../../../datatypes/variable/inline_variable";

const ModeControlAction = ({
  mode,
  setMode,
}: {
  mode: "variable" | "expression";
  setMode: (mode: "variable" | "expression") => void;
}) => {
  const isVariable = mode === "variable";
  useAction(
    {
      index: 1,
      title: isVariable ? "Switch to expression" : "Switch to variable",
      icon: isVariable ? elllIcons16.state : elllIcons16.variable,
      handler: () => {
        setMode(isVariable ? "expression" : "variable");
      },
    },
    [mode],
  );
  return <></>;
};
const AddVariableAction = ({ handler }: { handler: () => void }) => {
  useAction({
    index: 0,
    title: "Add variable",
    icon: elllIcons16.plus,
    handler,
  });
  return <></>;
};

function ExpressionVariableEntry({
  styles,
  properties,
  theme,
}: {
  styles: Style<EvaluableMap<StyleData>>[];
  properties: StylePropertyName[];
  theme?: Theme;
}) {
  const key = properties.join(",");
  const [value$, value] = useCommonReactivePair(
    properties.flatMap((property) =>
      styles.map((style) => style.propertyValue$(property)),
    ),
    properties.flatMap((property) =>
      styles.map((style) => style.propertyValue(property)),
    ),
    key,
  );
  const allowedTypes = properties.map(
    (property) => stylePropertyConfigMap[property].allowedTypes,
  );
  const commonAllowedTypes = allowedTypes.reduce((acc, types) => {
    return acc.filter((type) => types.includes(type));
  }, allowedTypes[0] ?? []);

  const isExp = isExpression(value);

  const [mode, setMode] = useState<"variable" | "expression">(
    isExp ? "expression" : "variable",
  );
  const [addingVariable, setAddingVariable] = useState(false);

  let content = <></>;
  let title = "";

  if (mode === "variable") {
    title = "Variables";
    content = (
      <>
        <AddVariableAction
          handler={() => {
            setAddingVariable(true);
          }}
        />
        <InlineVariableControl
          value={value}
          value$={value$}
          onChange={(value) => {
            properties.forEach((property) =>
              styles.forEach((style) => {
                style.setProperty(property, value);
              }),
            );
          }}
          settings={{
            allowedTypes: commonAllowedTypes,
            newEntry: addingVariable,
            onNewEntryComplete: (variable) => {
              setAddingVariable(false);
              if (variable) {
                properties.forEach((property) =>
                  styles.forEach((style) => {
                    style.setProperty(property, {
                      __var: variable.id,
                    });
                  }),
                );
              }
            },
            theme,
          }}
        />
      </>
    );
  } else {
    title = "Expression";
    content = (
      <InlineExpressionControl
        value={value}
        value$={value$}
        onChange={(value) => {
          properties.forEach((property) => {
            styles.forEach((style) => {
              style.setProperty(property, value);
            });
          });
        }}
      />
    );
  }

  return (
    <ColumnControlContainer title={title} noPadding>
      <ModeControlAction mode={mode} setMode={setMode} />
      {content}
    </ColumnControlContainer>
  );
}

function StylePropertyMenu({
  styles,
  properties,
  theme,
}: {
  styles: Style<EvaluableMap<StyleData>>[];
  properties: StylePropertyName[];
  theme?: Theme;
}) {
  return (
    <>
      <ExpressionVariableEntry
        styles={styles}
        properties={properties}
        theme={theme}
      />

      {/* <ColumnControlContainer title="Reset" noPadding>
        <RowControlContainer>
          <ControlButton
            label="Reset"
            align="center"
            onClick={() => {
              properties.forEach((property) =>
                styles.forEach((style) => {
                  style.setProperty(property, undefined);
                }),
              );
            }}
          />
        </RowControlContainer>
      </ColumnControlContainer> */}
    </>
  );
}

export function StylePropertyView({
  styles,
  properties,
  theme,
  menus,
}: {
  styles: Style<EvaluableMap<StyleData>>[];
  properties: StylePropertyName[];
  theme?: Theme;
  menus?: Array<{
    key?: string;
    title: string;
    viewId: string;
  }>;
}) {
  const menuElements =
    menus?.map((menu, index) => (
      <ColumnControlContainer
        key={menu.key ?? index}
        title={menu.title}
        noPadding
        indent
      >
        <ViewComponent
          key={menu.key ?? menu.viewId}
          id={menu.viewId}
          props={{
            styles,
            properties,
          }}
        />
      </ColumnControlContainer>
    )) ?? [];

  menuElements?.push(
    <StylePropertyMenu
      key="default"
      styles={styles}
      properties={properties}
      theme={theme}
    />,
  );

  return (
    <div
      className="el-space-y-4"
      style={{
        width: 240,
      }}
    >
      {menuElements}
    </div>
  );
}
