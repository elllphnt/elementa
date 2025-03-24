// import {
//   elllIcons16,
//   Icon,
//   TreeEntry,
//   useAction,
//   useControlMenu,
// } from "@repo/components";
// import { Style } from "@repo/elementa-models";
// import { useManyObservables } from "@repo/utils";
// import { useCallback, useEffect, useMemo } from "react";
// import { BehaviorSubject } from "rxjs";

import { filterToCss } from "@elllphnt/elll-element";
import {
  StyleFragmentData,
  StyleFragmentType,
} from "@elllphnt/elll-element/types/_primitives/style/fragments/fragment";
import {
  elllIcons16,
  Icon,
  TreeEntry,
  useAction,
  useControlMenu,
} from "@repo/components";
import { Style } from "@repo/elementa-models";
import { useManyObservables } from "@repo/utils";
import { keys } from "~/src/libs/keys";
import { resolveArrayIntersection } from "~/src/libs/utils";

function FilterControlEntry({
  styles,
  filter,
}: {
  styles: Style[];
  filter: StyleFragmentData<StyleFragmentType.Filter>;
}) {
  const { openMenu } = useControlMenu();
  let text = "";
  try {
    text = filterToCss(filter.data);
  } catch (e) {
    text = filter.data.type;
  }

  return (
    <TreeEntry
      icon={<Icon name={elllIcons16.opacity} />}
      className="el-border"
      onClick={() => {
        openMenu({
          title: "Effect",
          viewId: keys.views.modals.effect,
          props: {
            styles,
            fragmentId: filter._id,
          },
        });
      }}
      actions={[
        {
          icon: <Icon name={elllIcons16.cross} />,
          handler: () => {
            styles.forEach((style) => {
              style.fragmentRegistry.removeFragment(filter._id);
              const backgroundFiltersValue = style.propertyValue("filters");
              let backgroundFilters =
                typeof backgroundFiltersValue === "string"
                  ? backgroundFiltersValue.split(",").map((s) => s.trim())
                  : [];
              backgroundFilters = backgroundFilters.filter(
                (id) => id !== filter._id,
              );
              style.setProperty("filters", backgroundFilters.join(","));
            });
          },
        },
      ]}
    >
      {text}
    </TreeEntry>
  );
}

export function StyleEffectsControlSheet({ styles }: { styles: Style[] }) {
  const allFilters = useManyObservables(
    styles.map((style) =>
      style.fragmentRegistry.fragments$(StyleFragmentType.Filter),
    ),
    styles.map((style) =>
      style.fragmentRegistry.fragments(StyleFragmentType.Filter),
    ),
    styles.map((style) => style.key).join("."),
  );
  const filterValues = useManyObservables(
    styles.map((s) => s.propertyValue$("filters")),
    styles.map((s) => s.propertyValue("filters")),
    styles.map((style) => style.key).join("."),
  );
  const commonUsedFilterIds = resolveArrayIntersection(
    filterValues.map((v) =>
      typeof v === "string" ? v.split(",").map((v) => v.trim()) : [],
    ),
  );
  const commonUnusedFilterMap: Record<
    string,
    StyleFragmentData<StyleFragmentType.Filter>
  > = Object.fromEntries(
    resolveArrayIntersection(allFilters, (a, b) => a._id === b._id).map((g) => [
      g._id,
      g,
    ]),
  );

  const commonUsedFilters: StyleFragmentData<StyleFragmentType.Filter>[] = [];
  commonUsedFilterIds.forEach((id) => {
    const filter = commonUnusedFilterMap[id];
    if (filter) {
      delete commonUnusedFilterMap[id];
      commonUsedFilters.push(filter);
    }
  });
  const commonUnusedFilters: StyleFragmentData<StyleFragmentType.Filter>[] =
    Object.values(commonUnusedFilterMap);

  useAction({
    title: "Add Filter",
    icon: elllIcons16.plus,
    index: Number.MAX_SAFE_INTEGER,
    handler: () => {
      styles.forEach((style) => {
        const fragment = style.fragmentRegistry.addFragment(
          StyleFragmentType.Filter,
          {
            type: "blur",
            radius: {
              value: 5,
              unit: "px",
            },
          },
        );
        const backgroundFiltersValue = style.propertyValue("filters");
        const backgroundFilters =
          typeof backgroundFiltersValue === "string"
            ? backgroundFiltersValue.split(",").map((s) => s.trim())
            : [];
        backgroundFilters.unshift(fragment._id);
        style.setProperty("filters", backgroundFilters.join(","));
      });
    },
  });

  return (
    <>
      {commonUsedFilters.map((filter) => (
        <FilterControlEntry key={filter._id} styles={styles} filter={filter} />
      ))}

      {commonUnusedFilters.length ? (
        <>
          <hr />
          {commonUnusedFilters.map((filter) => (
            <FilterControlEntry
              key={filter._id}
              styles={styles}
              filter={filter}
            />
          ))}
        </>
      ) : (
        <></>
      )}
    </>
  );
}
