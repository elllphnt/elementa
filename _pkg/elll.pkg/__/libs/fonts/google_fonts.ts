export type GoogleFontData = {
  family: string;
  variants: string[];
  files: {
    [key: string]: string;
  };
  category: string;
  axes: Array<{
    tag: string;
    start: number;
    end: number;
  }>;
};

let googleFonts: GoogleFontData[] = [];
const googleFontsApiKey = "AIzaSyAr1uTw-KYE3qw_cH8zFm1Fekm9h_5KN4g";
export async function getGoogleFonts() {
  if (googleFonts.length > 0) return googleFonts;
  const res = await fetch(
    `https://www.googleapis.com/webfonts/v1/webfonts?key=${googleFontsApiKey}`,
  ).then((response) => response.json());

  googleFonts = res.items;
  return googleFonts;
}
