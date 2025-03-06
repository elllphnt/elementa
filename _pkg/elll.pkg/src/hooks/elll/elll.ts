import { useContext } from "react";
import { ElllContext } from "~/src/contexts/elll";

export function useElll() {
  const elll = useContext(ElllContext);
  if (!elll) {
    throw new Error("useElll must be used within a ElllContextProvider");
  }

  return elll;
}
