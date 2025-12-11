/* ==========================================================================*/
// route.ts — Next Steps API endpoint
/* ==========================================================================*/
// Purpose: Handle next steps generation requests for articles
// Sections: Imports, Route Handler
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Next.js Core ---
import { NextRequest, NextResponse } from "next/server";

// Core Modules ----
import { inngest } from "@/core/inngest/client";

// Internal Modules ----
import type { NextStepsApiRequest } from "@/domains/next-steps";
import { getArticleContentBySlugAndVersion, generateNextSteps } from "@/domains/next-steps";

/* ==========================================================================*/
// Route Handler
/* ==========================================================================*/

export async function POST(request: NextRequest) {
  try {
    // 1️⃣ Validate request -----
    const data: NextStepsApiRequest = await request.json();

    if (!data.slug?.trim()) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    if (!data.version?.trim()) {
      return NextResponse.json({ error: "Version is required" }, { status: 400 });
    }

    if (!data.orgId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    // 2️⃣ Async mode: trigger Inngest function -----
    if (data.async) {
      const { ids } = await inngest.send({
        name: "next-steps/trigger/generate",
        data: { orgId: data.orgId, slug: data.slug, version: data.version },
      });

      return NextResponse.json({
        success: true,
        async: true,
        runId: ids[0],
        message: "Next steps generation started",
      });
    }

    // 3️⃣ Sync mode: get article content -----
    const articleContent = await getArticleContentBySlugAndVersion(data.orgId, data.slug, data.version);

    if (!articleContent) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // 4️⃣ Generate next steps -----
    const result = await generateNextSteps(articleContent);

    // 5️⃣ Return response -----
    return NextResponse.json(result.response);
  } catch (error) {
    console.error("Next steps request failed:", error);

    return NextResponse.json(
      {
        error: "Failed to generate next steps",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
