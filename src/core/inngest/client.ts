/* ==========================================================================*/
// client.ts — Inngest client configuration and initialization
/* ==========================================================================*/
// Purpose: Create and configure Inngest client for event handling
// Sections: Imports, Configuration, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// External Packages ---
import { Inngest, EventSchemas } from "inngest";
import winston from "winston";
import { join } from "path";

// Inngest Function Request Types
// IMPORTANT: This is a temporary import and will be removed eventually, or we need to find a better way to handle this.
import { DraftingInngestEvent } from "@/domains/drafting/common/types/inngest";

// Inngest Health Function Request Types
import { InngestHealthInngestEvent } from "@/domains/inngest_health/function";

// ======================================================
// Event Schemas
// ======================================================

type Events = {
  "drafting/trigger/aggregation": DraftingInngestEvent;
  "drafting/trigger/digestion": DraftingInngestEvent;
  "inngest_health/trigger/hello.world": InngestHealthInngestEvent;
};

/* ==========================================================================*/
// Configuration
/* ==========================================================================*/

/**
 * Winston logger configuration for Inngest - console only for Vercel compatibility
 */
const createLogger = () => {
  const transports: winston.transport[] = [
    // Console for development and production (Vercel)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ];

  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

  // Only add file transport in development and when not running on Vercel or AWS Lambda
  if (process.env.IS_DEV || !isServerless) {
    transports.push(
      new winston.transports.File({
        filename: join(process.cwd(), "logs", "pipeline.log"),
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
        level: "info"
      })
    );
  }

  return winston.createLogger({
    level: "info",
    exitOnError: false,
    transports
  });
};

/**
 * Inngest client instance for sending and receiving events.
 */
const inngest = new Inngest({ 
  id: "sesha-api", 
  schemas: new EventSchemas().fromRecord<Events>(),
  logger: createLogger()
});

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { inngest };
