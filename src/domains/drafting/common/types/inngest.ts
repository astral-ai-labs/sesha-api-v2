// TODO: hopefully delete this file eventually

import { RequestMetadata } from "./_primitives";

type DraftingInngestEvent = {
  data: {
    metadata: RequestMetadata;
  };
};

// ======================================================
// Public API
// ======================================================

export type { DraftingInngestEvent };
