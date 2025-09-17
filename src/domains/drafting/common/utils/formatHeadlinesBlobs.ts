/* ==========================================================================*/
// formatHeadlinesBlobs.ts — Format headline and blobs for display
/* ==========================================================================*/
// Purpose: Format headline and blobs into consistent text format
/* ==========================================================================*/

/**
 * Format headline and blobs into consistent display text.
 */
function formatHeadlinesBlobs(headline: string, blobs: string[]): string {
  return `Headline: ${headline}\n${blobs.map((blob) => `Blob: ${blob}`).join("\n")}`;
}

// ===================================================
// Public API
// ===================================================
export { formatHeadlinesBlobs };
