export interface Identifiable {
  id: string;
  clone(): this;
}
