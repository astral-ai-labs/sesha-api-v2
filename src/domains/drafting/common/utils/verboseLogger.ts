/* ==========================================================================*/
// verboseLogger.ts — Verbose logging for drafting pipeline debugging
/* ==========================================================================*/
// Purpose: Thin logger that only logs when verbose mode is enabled
// Logs: initial request, AI step outputs, and final prompts
// When IS_DEV=true, also saves logs to individual files per pipeline run
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// No file system imports needed - winston handles file logging

/* ==========================================================================*/
// Types & Interfaces
/* ==========================================================================*/

interface Logger {
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  debug(...args: unknown[]): void;
}

interface LoggedPrompts {
  system?: string;
  user?: string;
  assistant?: string;
}

// No complex types needed - winston handles structured logging

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Simple verbose logger for pipeline debugging
 */
export class VerboseLogger {
  constructor(
    private inngestLogger: Logger,
    private isVerbose: boolean,
    private runId: string
  ) {}

  /**
   * Log initial request payload once per pipeline run
   */
  logInitialRequest(request: unknown): void {
    if (!this.isVerbose) return;
    
    this.inngestLogger.info("Pipeline started", { 
      type: "pipeline_start",
      runId: this.runId,
      request
    });
  }

  /**
   * Log final prompts before AI call
   */
  logStepPrompts(stepName: string, prompts: LoggedPrompts): void {
    if (!this.isVerbose) return;
    
    this.inngestLogger.info("Step prompts", {
      type: "step_prompts",
      runId: this.runId,
      step: stepName,
      prompts
    });
  }

  /**
   * Log step output after AI call
   */
  logStepOutput(stepName: string, output: unknown): void {
    if (!this.isVerbose) return;
    
    this.inngestLogger.info("Step completed", {
      type: "step_output",
      runId: this.runId,
      step: stepName,
      output
    });
  }
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/

/**
 * Create verbose logger from Inngest function context
 */
export function createVerboseLogger(logger: Logger, isVerbose: boolean, runId: string): VerboseLogger {
  return new VerboseLogger(logger, isVerbose, runId);
}

export type { LoggedPrompts };
