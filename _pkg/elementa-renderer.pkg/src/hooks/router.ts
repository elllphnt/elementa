import { useContext } from "react";
import { RouterContext } from "../contexts/router";

export function useRouter() {
  const router = useContext(RouterContext);
  return router;
}
