import { TypefaceData } from "@elllphnt/elll-element";
import { ScrollArea } from "@repo/components";
import { useRect } from "@repo/utils";
import cx from "classnames";
import { useEffect, useRef, useState } from "react";
import { FixedSizeList as List } from "react-window";
import WebFont from "webfontloader";
import { useElllProject } from "~/src/hooks/project/project";
import { useProjectTypefaces } from "~/src/hooks/project/typefaces";
import { useWorkspaceState } from "~/src/hooks/shell/workspace";
import { fontVariantName } from "~/src/libs/fonts/font";
import { getGoogleFonts, GoogleFontData } from "~/src/libs/fonts/google_fonts";
import { genId } from "~/src/libs/id";

type FontOperationData = Pick<TypefaceData, "definition" | "variants">;

function GoogleFontVariantLine({
  variant,
  font,
}: {
  variant: string;
  font: GoogleFontData;
}): JSX.Element {
  const typefaces = useProjectTypefaces();
  const project = useElllProject();
  const typefacesKey = typefaces.map((typeface) => typeface.id).join(",");

  useEffect(() => {
    WebFont.load({
      classes: false,
      google: {
        families: [font.family + ":" + variant],
      },
    });
  }, [variant]);

  const installed = typefaces.some(
    (typeface) =>
      typeface.definition?.family === font.family &&
      typeface.variants?.includes(variant),
  );

  const handleInstall = () => {
    let typeface = typefaces.find(
      (typeface) => typeface.definition?.family === font.family,
    );
    if (!typeface) {
      typeface = {
        id: genId(),
        definition: {
          family: font.family,
          srcset: font.files,
          variants: font.variants,
          axes: font.axes,
          category: font.category,
        },
        variants: [variant],
      };
      project.styleManager.typefaceSheet.addTypeface(typeface);
    } else {
      project.styleManager.typefaceSheet.installFonts(typeface.id, [variant]);
    }
  };

  const handleUninstall = () => {
    let typeface = typefaces.find(
      (typeface) => typeface.definition?.family === font.family,
    );
    if (typeface) {
      project.styleManager.typefaceSheet.uninstallFonts(typeface.id, [variant]);
    }
  };

  return (
    <div className="el-space-y-1">
      <div
        className="el-flex"
        style={{
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="el-text-sm el-text-fg">{fontVariantName(variant)}</div>

        {installed ? (
          <button
            className="el-text-red el-font-semibold"
            onClick={handleUninstall}
          >
            Remove
          </button>
        ) : (
          <button
            className="el-text-pm el-font-semibold"
            onClick={handleInstall}
          >
            Install
          </button>
        )}
      </div>
      <div
        className="el-text-sm"
        style={{
          fontSize: 16,
          fontFamily: font.family,
          fontWeight: variant,
          fontStyle: variant.includes("italic") ? "italic" : "normal",
        }}
      >
        The quick brown fox jumps over the lazy dog.
      </div>
    </div>
  );
}

function GoogleFontListItem({
  data,
  onClick,
  active,
}: {
  data: GoogleFontData;
  onClick?: () => void;
  active?: boolean;
}) {
  useEffect(() => {
    WebFont.load({
      classes: false,
      google: {
        families: [data.family + ":400"],
        text:
          data.family +
          " 1234567890 ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz",
      },
    });
  }, []);

  return (
    <div
      className={cx("el-px-2 el-h-7 el-cursor-pointer el-rounded", {
        "hover:el-bg-fg/5": !active,
        "el-bg-fg/10": active,
      })}
      style={{
        fontFamily: data.family,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        textOverflow: "ellipsis",
        textWrap: "nowrap",
        fontSize: 16,
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.();
      }}
    >
      {data.family}
    </div>
  );
}
function GoogleTypefaceList({
  fonts,
  onFont,
  activeFont,
}: {
  fonts: GoogleFontData[];
  onFont: (font: GoogleFontData) => void;
  activeFont?: GoogleFontData;
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const rect = useRect(ref);

  return (
    <div ref={ref} className="el-h-full el-w-full">
      {rect ? (
        <List
          height={rect.height}
          width={rect.width}
          itemCount={fonts.length}
          itemSize={32}
          overscanCount={30}
        >
          {({ index, style }) => (
            <div key={index} style={{ ...style, paddingRight: 4 }}>
              <GoogleFontListItem
                data={fonts[index]}
                onClick={() => onFont(fonts[index])}
                active={activeFont?.family === fonts[index].family}
              />
            </div>
          )}
        </List>
      ) : null}
    </div>
  );
}
function GoogleFontPreview({ data }: { data?: GoogleFontData }): JSX.Element {
  useEffect(() => {
    if (!data) return;

    WebFont.load({
      classes: false,
      google: {
        families: [data.family + ":400"],
      },
    });
  }, [data?.family]);

  if (!data) {
    return (
      <div
        className="el-h-full el-w-full"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          className="el-text-fg el-space-y-4"
          style={{ textAlign: "center" }}
        >
          <p>Select a font to preview.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="el-h-full el-w-full el-space-y-2 el-flex el-flex-col">
      <div
        style={{
          display: "el-flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="el-text-fg">{data.family}</div>
      </div>
      <hr />
      <div
        style={{
          fontFamily: data.family,
          fontSize: 20,
          lineHeight: "1.3em",
        }}
      >
        The quick brown fox jumps over the lazy dog.
      </div>
      <hr />
      <div
        className="el-grow"
        style={{
          overflow: "hidden",
        }}
      >
        <ScrollArea scrollY containerClassName="el-space-y-3" noHandle>
          {data.variants.map((variant, index) => (
            <>
              {index > 0 ? <hr /> : null}
              <GoogleFontVariantLine
                key={variant}
                variant={variant}
                font={data}
              />
            </>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
}

export function GoogleTypefaceBrowser(): JSX.Element {
  const stateKey = ["google-typeface-browser"];
  const [search, setSearch] = useWorkspaceState<string>(
    [...stateKey, "search"],
    "",
  );
  const [activeFamily, setActiveFamily] = useWorkspaceState<string | undefined>(
    [...stateKey, "activeFont"],
  );
  const [fonts, setFonts] = useState<GoogleFontData[]>([]);

  const filteredFonts = fonts.filter((font) =>
    font.family.toLowerCase().includes(search.toLowerCase()),
  );

  // get google fonts
  useEffect(() => {
    getGoogleFonts().then((fonts) => {
      setFonts(fonts);
    });
  }, []);

  const activeFont = fonts.find((font) => font.family === activeFamily);

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
      }}
    >
      <div
        style={{
          width: 200,
          flexShrink: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        className="el-gap-3 el-p-3"
      >
        <input
          className="el-w-full el-h-8 el-px-2 el-border el-rounded"
          style={{
            outline: "none",
          }}
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div
          style={{
            flexGrow: 1,
            overflow: "hidden",
          }}
        >
          <GoogleTypefaceList
            fonts={filteredFonts}
            onFont={(font) => {
              setActiveFamily(font.family);
            }}
            activeFont={activeFont}
          />
        </div>
      </div>

      <div
        className="el-bg-bg-200"
        style={{
          height: "100%",
          width: 1,
        }}
      />

      <div
        className="el-grow el-p-3"
        style={{
          height: "100%",
        }}
      >
        <GoogleFontPreview data={activeFont} />
      </div>
    </div>
  );
}
