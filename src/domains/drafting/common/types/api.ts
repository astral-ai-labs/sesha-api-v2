/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Internal (Current Module) ----
import { RequestMetadata } from "./_primitives";

/* ==========================================================================*/
// Types (Component-specific only)
/* ==========================================================================*/

interface DraftingAPIRequest extends RequestMetadata {}

interface DraftingAPIResponse {
  /** Unique identifier for the article */
  articleId: string;
  success: boolean;
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/

export type { DraftingAPIRequest, DraftingAPIResponse };
