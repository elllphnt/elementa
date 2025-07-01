import { init } from "@paralleldrive/cuid2";

export const genId = init({
  length: 10,
});
