import { init } from "@paralleldrive/cuid2";

let _genId = init({
  length: 10,
});
export const genId = () => {
  return _genId();
};

export function useGenId(genIdFn: () => string) {
  _genId = genIdFn;
}
