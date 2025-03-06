import { StyleUtilityGeneratorType } from "@repo/elementa";
import { genId, mapPropertyUtilitiesGenerator } from "../_utils";

export function flexGridUtilities({
  variableSetIds,
}: {
  variableSetIds: {
    fixedSizes: string;
    fractionalSizes: string;
  };
}): any[] {
  return [
    {
      _id: genId(),
      name: "Flex Basis",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "flex-basis",
          class: "basis-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "flex-basis",
          class: "basis-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "flex-basis",
          class: "basis-auto",
          value: "auto",
        },
      ],
    },
    {
      _id: genId(),
      name: "Flex Direction",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "flex-direction",
            class: `flex-${key}`,
            value,
          }),
          {
            "row": "row",
            "row-reverse": "row-reverse",
            "column": "column",
            "column-reverse": "column-reverse",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Flex Wrap",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "flex-wrap",
            class: `flex-${key}`,
            value,
          }),
          {
            "wrap": "wrap",
            "wrap-reverse": "wrap-reverse",
            "nowrap": "nowrap",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Flex",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "flex",
            class: `flex-${key}`,
            value,
          }),
          {
            1: "1 1 0%",
            auto: "1 1 auto",
            initial: "0 1 auto",
            none: "none",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Flex Grow",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "flex-grow",
          class: "grow-0",
          value: "0",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "flex-grow",
          class: "grow",
          value: "1",
        },
      ],
    },
    {
      _id: genId(),
      name: "Flex Shrink",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "flex-shrink",
          class: "shrink-0",
          value: "0",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "flex-shrink",
          class: "shrink",
          value: "1",
        },
      ],
    },
    {
      _id: genId(),
      name: "Order",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "order",
            class: `order-${key}`,
            value,
          }),
          {
            first: "-9999",
            last: "9999",
            none: "0",
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6",
            7: "7",
            8: "8",
            9: "9",
            10: "10",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Grid Template Columns",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "grid-template-columns",
            class: `grid-cols-${key}`,
            value,
          }),
          {
            none: "none",
            subgrid: "subgrid",
            1: "repeat(1, minmax(0, 1fr))",
            2: "repeat(2, minmax(0, 1fr))",
            3: "repeat(3, minmax(0, 1fr))",
            4: "repeat(4, minmax(0, 1fr))",
            5: "repeat(5, minmax(0, 1fr))",
            6: "repeat(6, minmax(0, 1fr))",
            7: "repeat(7, minmax(0, 1fr))",
            8: "repeat(8, minmax(0, 1fr))",
            9: "repeat(9, minmax(0, 1fr))",
            10: "repeat(10, minmax(0, 1fr))",
            11: "repeat(11, minmax(0, 1fr))",
            12: "repeat(12, minmax(0, 1fr))",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Grid Column Start / End",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "grid-column",
          class: "col-auto",
          value: "auto",
        },
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "grid-column",
            class: `col-span-${key}`,
            value,
          }),
          {
            1: "span 1 / span 1",
            2: "span 2 / span 2",
            3: "span 3 / span 3",
            4: "span 4 / span 4",
            5: "span 5 / span 5",
            6: "span 6 / span 6",
            7: "span 7 / span 7",
            8: "span 8 / span 8",
            9: "span 9 / span 9",
            10: "span 10 / span 10",
            11: "span 11 / span 11",
            12: "span 12 / span 12",
            full: "1 / -1",
          },
        ),
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "grid-column-start",
            class: `col-start-${key}`,
            value,
          }),
          {
            auto: "auto",
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6",
            7: "7",
            8: "8",
            9: "9",
            10: "10",
            11: "11",
            12: "12",
            13: "13",
          },
        ),
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "grid-column-end",
            class: `col-end-${key}`,
            value,
          }),
          {
            auto: "auto",
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6",
            7: "7",
            8: "8",
            9: "9",
            10: "10",
            11: "11",
            12: "12",
            13: "13",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Grid Template Rows",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "grid-template-rows",
            class: `grid-rows-${key}`,
            value,
          }),
          {
            1: "repeat(1, minmax(0, 1fr))",
            2: "repeat(2, minmax(0, 1fr))",
            3: "repeat(3, minmax(0, 1fr))",
            4: "repeat(4, minmax(0, 1fr))",
            5: "repeat(5, minmax(0, 1fr))",
            6: "repeat(6, minmax(0, 1fr))",
            7: "repeat(7, minmax(0, 1fr))",
            8: "repeat(8, minmax(0, 1fr))",
            9: "repeat(9, minmax(0, 1fr))",
            10: "repeat(10, minmax(0, 1fr))",
            11: "repeat(11, minmax(0, 1fr))",
            12: "repeat(12, minmax(0, 1fr))",
            none: "none",
            subgrid: "subgrid",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Grid Row Start / End",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "grid-row",
          class: "col-auto",
          value: "auto",
        },
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "grid-row",
            class: `col-span-${key}`,
            value,
          }),
          {
            1: "span 1 / span 1",
            2: "span 2 / span 2",
            3: "span 3 / span 3",
            4: "span 4 / span 4",
            5: "span 5 / span 5",
            6: "span 6 / span 6",
            7: "span 7 / span 7",
            8: "span 8 / span 8",
            9: "span 9 / span 9",
            10: "span 10 / span 10",
            11: "span 11 / span 11",
            12: "span 12 / span 12",
            full: "1 / -1",
          },
        ),
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "grid-row-start",
            class: `col-start-${key}`,
            value,
          }),
          {
            auto: "auto",
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6",
            7: "7",
            8: "8",
            9: "9",
            10: "10",
            11: "11",
            12: "12",
            13: "13",
          },
        ),
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "grid-row-end",
            class: `col-end-${key}`,
            value,
          }),
          {
            auto: "auto",
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6",
            7: "7",
            8: "8",
            9: "9",
            10: "10",
            11: "11",
            12: "12",
            13: "13",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Grid Auto Flow",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "grid-auto-flow",
            class: `grid-flow-${key}`,
            value,
          }),
          {
            "row": "row",
            "col": "column",
            "dense": "dense",
            "row-dense": "row dense",
            "col-dense": "column dense",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Grid Auto Columns",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "grid-auto-columns",
            class: `auto-cols-${key}`,
            value,
          }),
          {
            auto: "auto",
            min: "min-content",
            max: "max-content",
            fr: "minmax(0, 1fr)",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Grid Auto Rows",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "grid-auto-rows",
            class: `auto-rows-${key}`,
            value,
          }),
          {
            auto: "auto",
            min: "min-content",
            max: "max-content",
            fr: "minmax(0, 1fr)",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Gap",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "gap",
          source: "",
          class: "gap-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "column-gap",
          source: "",
          class: "gap-x-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "row-gap",
          source: "",
          class: "gap-y-{{name}}",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Justify Content",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "justify-content",
            class: `justify-${key}`,
            value,
          }),
          {
            normal: "normal",
            start: "flex-start",
            end: "flex-end",
            center: "center",
            between: "space-between",
            around: "space-around",
            evenly: "space-evenly",
            stretch: "stretch",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Justify Items",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "justify-items",
            class: `justify-items-${key}`,
            value,
          }),
          {
            start: "start",
            end: "end",
            center: "center",
            stretch: "stretch",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Justify Self",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "justify-self",
            class: `justify-self-${key}`,
            value,
          }),
          {
            auto: "auto",
            start: "start",
            end: "end",
            center: "center",
            stretch: "stretch",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Align Content",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "align-content",
            class: `content-${key}`,
            value,
          }),
          {
            normal: "normal",
            center: "center",
            start: "flex-start",
            end: "flex-end",
            between: "space-between",
            around: "space-around",
            evenly: "space-evenly",
            baseline: "baseline",
            stretch: "stretch",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Align Items",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "align-items",
            class: `items-${key}`,
            value,
          }),
          {
            start: "flex-start",
            end: "flex-end",
            center: "center",
            baseline: "baseline",
            stretch: "stretch",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Align Self",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "align-self",
            class: `self-${key}`,
            value,
          }),
          {
            auto: "auto",
            start: "flex-start",
            end: "flex-end",
            center: "center",
            stretch: "stretch",
            baseline: "baseline",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Place Content",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "place-content",
            class: `place-content-${key}`,
            value,
          }),
          {
            center: "center",
            start: "start",
            end: "end",
            between: "space-between",
            around: "space-around",
            evenly: "space-evenly",
            baseline: "baseline",
            stretch: "stretch",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Place Items",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "place-items",
            class: `place-items-${key}`,
            value,
          }),
          {
            start: "start",
            end: "end",
            center: "center",
            baseline: "baseline",
            stretch: "stretch",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Place Self",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "place-self",
            class: `place-self-${key}`,
            value,
          }),
          {
            auto: "auto",
            start: "start",
            end: "end",
            center: "center",
            stretch: "stretch",
          },
        ),
      ],
    },
  ];
}
