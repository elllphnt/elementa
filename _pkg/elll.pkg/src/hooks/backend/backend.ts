import { useElll } from "../elll/elll";

export function useBackend() {
  const elll = useElll();
  return elll.backend;
}
