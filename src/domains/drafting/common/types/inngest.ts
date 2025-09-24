// TODO: hopefully delete this file eventually

import { RequestMetadata } from "./primitives";

type DraftingInngestEvent = {
  data: {
    request: RequestMetadata;
    verbose: boolean;
  };
};

// ======================================================
// Public API
// ======================================================

export type { DraftingInngestEvent };
