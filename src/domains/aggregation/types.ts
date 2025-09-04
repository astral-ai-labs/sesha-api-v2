/* ==========================================================================*/
// types.ts — Aggregation Feature Shared Types
/* ==========================================================================*/
// Purpose: Shared type definitions for aggregation pipeline steps
/* ==========================================================================*/

/* ==========================================================================*/
// Source-Facts Mapping Types
/* ==========================================================================*/

/**
 * Individual source facts result from parallel processing.
 * Used to maintain source-to-facts relationship throughout the pipeline.
 */
export interface SourceFactsResult {
    sourceNumber: number;
    extractedFacts: string;
  }
  
  /**
   * Individual conditional facts result from parallel processing.
   * Used for conditionally processed facts while maintaining source relationship.
   */
  export interface SourceFactsConditionalResult {
    sourceNumber: number;
    extractedFactsConditional: string;
  }