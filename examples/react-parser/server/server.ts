import type { InMemoryInfrastructureData } from "@elllphnt/elementa-models";
import {
  compileComponentModule,
  getStylesheetFromCssModule,
  parseComponentModule,
  parseCssModule,
  standardizeComponent,
} from "@elllphnt/elementa-react-parser";
import cors from "cors";
import express, { json } from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 3001;

// Ensure directory exists
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Save parsed module to JSON file
const saveModuleToJson = (filePath: string, data: any) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Saved to ${filePath}`);
};

// Middleware
app.use(cors());
app.use(json());

// New endpoint for standardization
app.post("/standardize", (req, res) => {
  try {
    const { tsx } = req.body;
    if (!tsx) {
      return res.status(400).json({ error: "No TSX provided" });
    }

    // Create timestamp directory for logs
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const processDir = path.join("local", "standardize", timestamp);
    ensureDirectoryExists(processDir);

    // Save original TSX
    fs.writeFileSync(path.join(processDir, "original.tsx"), tsx);

    // Process the TSX
    const standardizedTsx = standardizeComponent(tsx);

    // Save standardized TSX
    fs.writeFileSync(
      path.join(processDir, "standardized.tsx"),
      standardizedTsx
    );

    res.json({ standardizedTsx });
  } catch (error) {
    console.error("Error standardizing TSX:", error);
    res.status(500).json({ error: "Error standardizing TSX" });
  }
});

app.post("/process", (req, res) => {
  try {
    const { tsx, css } = req.body;

    // Create timestamp directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const processDir = path.join("local", "processes", timestamp);
    ensureDirectoryExists(processDir);

    // Process the TSX and CSS
    const cssModule = parseCssModule(css);
    const standardizedTsx = standardizeComponent(tsx);

    // Save standardized TSX
    fs.writeFileSync(path.join(processDir, "std.tsx"), standardizedTsx);
    console.log(
      `Saved standardized TSX to ${path.join(processDir, "std.tsx")}`
    );

    const componentModule = parseComponentModule({
      code: standardizedTsx,
      getStylesheet: (classes, conditionals) => {
        // Create stylesheets directory
        const stylesheetsDir = path.join(processDir, "stylesheets");
        ensureDirectoryExists(stylesheetsDir);

        // Log input for getStylesheetFromCssModule
        const stylesheetInput = { classes, conditionals, module: cssModule };
        saveModuleToJson(
          path.join(stylesheetsDir, `input-${Date.now()}.json`),
          stylesheetInput
        );

        // Get the stylesheet
        const stylesheet = getStylesheetFromCssModule({
          classes,
          conditionals,
          module: cssModule,
          getModifierDefinition: () => undefined,
        });

        // Log output from getStylesheetFromCssModule
        saveModuleToJson(
          path.join(stylesheetsDir, `output-${Date.now()}.json`),
          stylesheet
        );

        return stylesheet;
      },
    });

    // Save parsed modules to JSON files
    saveModuleToJson(path.join(processDir, "css.json"), cssModule);
    saveModuleToJson(path.join(processDir, "jsx.json"), componentModule);

    const resources = compileComponentModule({
      module: componentModule,
      getResourcePath: (_, resource) =>
        resource === componentModule.main
          ? "file:__main__"
          : `file:${resource}`,
      getAdjustedPath: (_, path) => path,
    });

    const infra: InMemoryInfrastructureData = {
      projects: [
        {
          id: "1",
        },
      ],
      files: Object.entries(resources).map(([name, resource]) => ({
        id: name === componentModule.main ? "__main__" : name,
        name,
        content: resource.content,
        projectId: "1",
      })),
    };

    res.json({
      infra,
      url: `file:1/__main__`,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Error processing request" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
