import type { FlatConfigItem, Payload } from "./resolver";

export interface ESLintConfig {
  configs: FlatConfigItem[];
  dependencies: string[];
  payload: Payload;
}

export { readFlatConfig } from "./resolver";
