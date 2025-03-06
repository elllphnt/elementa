import { ScrollArea } from "@repo/components";
import { TypefaceData } from "@repo/elementa";
import { useManyObservables, useRect } from "@repo/utils";
import cx from "classnames";
import { useEffect, useRef, useState } from "react";
import { FixedSizeList as List } from "react-window";
import {
  useElllProject,
  useProjectTypefaces,
} from "../../../../../hooks/project/project";
import { useWorkspaceState } from "../../../../../hooks/shell/workspace";
import {
  getGoogleFonts,
  GoogleFontData,
} from "../../../../../libs/fonts/google_fonts";
import { Webfont } from "../../../../../libs/fonts/webfont";
import { fontVariantName } from "../../../../../libs/typeface";

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
  const typefaceData = useManyObservables(
    typefaces.map((typeface) => typeface.data$),
    typefaces.map((typeface) => typeface.data),
    typefacesKey,
  );

  useEffect(() => {
    Webfont?.then((w) => {
      w.load({
        classes: false,
        google: {
          families: [font.family + ":" + variant],
        },
      });
    });
  }, [variant]);

  const installed = typefaceData.some(
    (typeface) =>
      typeface.definition?.family === font.family &&
      typeface.variants?.includes(variant),
  );

  const handleInstall = () => {
    project.typefaceManager.installFonts(
      {
        family: font.family,
        srcset: font.files,
        variants: font.variants,
        axes: font.axes,
        category: font.category,
      },
      [variant],
    );
  };

  const handleUninstall = () => {
    project.typefaceManager.uninstallFonts(
      {
        family: font.family,
        srcset: font.files,
        variants: font.variants,
        axes: font.axes,
        category: font.category,
      },
      [variant],
    );
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
    Webfont?.then((w) => {
      w.load({
        classes: false,
        google: {
          families: [data.family + ":400"],
          text: data.family,
        },
      });
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
    Webfont?.then((w) => {
      if (!data) return;

      w.load({
        classes: false,
        google: {
          families: [data.family + ":400"],
        },
      });
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
          fontSize: 18,
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

export function GoogleTypefaceBrowser({
  onTypeface,
}: {
  onTypeface?: (typeface: FontOperationData) => void;
}): JSX.Element {
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
      className="el-space-x-3"
      style={{
        display: "flex",
        height: "100%",
      }}
    >
      <div
        style={{
          width: 160,
          flexShrink: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
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
        className="grow"
        style={{
          height: "100%",
        }}
      >
        <GoogleFontPreview data={activeFont} />
      </div>
    </div>
  );
}
