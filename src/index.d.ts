import { InitType } from "./types";

export interface EntelligenceChat {
  init: (config: InitType) => void;
}

export * from './types'; 