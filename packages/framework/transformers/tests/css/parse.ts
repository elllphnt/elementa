import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { getStyleClassFromCssModule, parseCssModule } from "~/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const css = `
#root {
    color: red;

    &.active {
        color: green;
    }
    &.ko.active {
        color: pink;

        .nested.active {
            color: purple;
        }

        #nested_id {
            color: orange;
        }
    }

    @media (max-width: 600px) {
        color: red;
    }
}

.a_link {
    color: blue;

    .active {
        color: yellow;
    }

    #nested_id_2 {
        color: orange;
    }

    @media (max-width: 600px) {
        color: red;
    }

    @container (color: red) {
        color: green;
    }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
`;

const outputPath = join(__dirname, "parsed.json");
const module = parseCssModule(css);
fs.writeFileSync(outputPath, JSON.stringify(module, null, 2));

const extractions: Array<{
  id?: string;
  classes?: (string | [string, string])[];
}> = [
  {
    id: "root",
    classes: ["active", ["active", "if(active)"], ["ko", "if(ko)"]],
  },
  {
    classes: ["a_link", "active"],
  },
  {
    id: "root",
    classes: ["a_link"],
  },
];

const extracted = extractions.map((extraction) => {
  const { id, classes } = extraction;
  const styleClass = getStyleClassFromCssModule({
    id: id ?? "",
    classes: classes ?? [],
    module,
    getModifierDefinition: () => {
      return undefined;
    },
  });
  return {
    id,
    classes,
    styleClass,
  };
});

const outputExtractionPath = join(__dirname, "extracted.json");
fs.writeFileSync(outputExtractionPath, JSON.stringify(extracted, null, 2));
console.log(`Parsed CSS module written to ${outputPath}`);
console.log(`Extracted styles written to ${outputExtractionPath}`);
