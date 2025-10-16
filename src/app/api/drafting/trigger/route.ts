/* ==========================================================================*/
// route.ts — Drafting pipeline trigger API endpoint
/* ==========================================================================*/
// Purpose: Trigger either digestion or aggregation pipeline based on ingestion type
// Sections: Imports, Types, Route Handler, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Next.js Core ---
import { NextRequest, NextResponse } from "next/server";

// Internal Modules ----
import { inngest } from "@/core/inngest/client";
import type { DraftType, LengthRange, BlobsCount, ModelSelection } from "@/domains/drafting/common/types/primitives";

/* ==========================================================================*/
// Types & Interfaces
/* ==========================================================================*/

interface TriggerRequest {
  articleId: string;
  userId: string;
  orgId: string;
  ingestionType: DraftType;
  lengthRange: LengthRange;
  numberOfBlobs: BlobsCount;
  modelSelection: ModelSelection;
  verbose?: boolean;
}

/* ==========================================================================*/
// Route Handler
/* ==========================================================================*/

export async function POST(request: NextRequest) {
  try {
    const body: TriggerRequest = await request.json();

    // 1️⃣ Validate required fields -----
    if (!body.articleId?.trim()) {
      return NextResponse.json({ error: "Article ID is required" }, { status: 400 });
    }

    if (!body.userId?.trim()) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (!body.ingestionType) {
      return NextResponse.json({ error: "Ingestion type is required" }, { status: 400 });
    }

    if (!body.orgId?.trim()) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    if (!body.lengthRange) {
      return NextResponse.json({ error: "Length range is required" }, { status: 400 });
    }

    if (!body.numberOfBlobs) {
      return NextResponse.json({ error: "Number of blobs is required" }, { status: 400 });
    }

    if (!body.modelSelection) {
      return NextResponse.json({ error: "Model selection is required" }, { status: 400 });
    }

    // 2️⃣ Determine event name based on ingestion type -----
    const eventName = body.ingestionType === "digest" ? "drafting/trigger/digestion" : "drafting/trigger/aggregation";

    // 3️⃣ Send event to appropriate pipeline -----
    const eventResult = await inngest.send({
      name: eventName,
      data: {
        request: {
          articleId: body.articleId,
          userId: body.userId,
          orgId: body.orgId,
          draftType: body.ingestionType,
          lengthRange: body.lengthRange,
          numberOfBlobs: body.numberOfBlobs,
          modelSelection: body.modelSelection,
        },
        verbose: body.verbose || true,
      },
    });

    // 4️⃣ Return success response -----
    return NextResponse.json({
      success: true,
      eventId: eventResult.ids[0],
      pipeline: body.ingestionType,
      message: `${body.ingestionType} pipeline triggered successfully`,
      articleId: body.articleId,
    });
  } catch (error) {
    console.error("Failed to trigger drafting pipeline:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to trigger pipeline",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
