import { useEffect, useMemo, useState } from "react";

export function useColorScheme() {
  const mq = useMemo(
    () => window.matchMedia("(prefers-color-scheme: dark)"),
    [],
  );
  const [scheme, setScheme] = useState<"light" | "dark">(
    mq.matches ? "dark" : "light",
  );

  useEffect(() => {
    const handleMatch = (match: boolean) => {
      if (match) {
        setScheme("dark");
      } else {
        setScheme("light");
      }
    };

    const handleThemeChange = (e: MediaQueryListEvent) => {
      handleMatch(e.matches);
    };
    mq.addEventListener("change", handleThemeChange);

    handleMatch(mq.matches);

    return () => {
      mq.removeEventListener("change", handleThemeChange);
    };
  }, []);

  return scheme;
}
