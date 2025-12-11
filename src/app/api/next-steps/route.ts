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

    // 2️⃣ Get article content -----
    const articleContent = await getArticleContentBySlugAndVersion(data.orgId, data.slug, data.version);

    if (!articleContent) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // 3️⃣ Generate next steps -----
    const result = await generateNextSteps(articleContent);

    // 4️⃣ Return response -----
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
