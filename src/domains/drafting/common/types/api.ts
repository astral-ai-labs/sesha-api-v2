/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Internal (Current Module) ----
import { RequestMetadata } from "./primitives";

/* ==========================================================================*/
// Types (Component-specific only)
/* ==========================================================================*/

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
