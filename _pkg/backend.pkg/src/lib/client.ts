import { Backend } from "./backend";
import { Factory } from "./factory";

export type ClientFactory<C = any> = Factory<{ backend: Backend }, C>;
