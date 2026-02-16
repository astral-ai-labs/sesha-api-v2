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

// External Packages ---
import Mustache from "mustache";

// Core Modules ----
import { inngest } from "@/core/inngest/client";

// Internal Modules ----
import type { NextStepsApiRequest } from "@/domains/next-steps";
import { getArticleContentBySlugAndVersion, generateNextStepsStreaming2 } from "@/domains/next-steps";

/* ==========================================================================*/
// Prompt Template
/* ==========================================================================*/

const PROMPT_TEMPLATE = `Suggest the next steps a reporter could take to improve and deepen this story.

IMPORTANT:

- ALWAYS use the web and the X search tool to find additional information before formulating your next steps.
- NEVER EVER EVER USE <grok:render>.

Here is the article you're coming up with next steps for: {{articleContent}}`;
/* ==========================================================================*/
// Route Handler
/* ==========================================================================*/

export async function POST(request: NextRequest) {
  try {
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

    if (!data.userId?.trim()) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (data.async) {
      const { ids } = await inngest.send({
        name: "next-steps/trigger/generate",
        data: { orgId: data.orgId, slug: data.slug, version: data.version, userId: data.userId },
      });

      return NextResponse.json({
        success: true,
        async: true,
        runId: ids[0],
        message: "Next steps generation started",
      });
    }

    // 1️⃣ Get article content ----
    const articleContent = await getArticleContentBySlugAndVersion(data.orgId, data.slug, data.version);

    // 2️⃣ Check if article content is found ----
    if (!articleContent) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // 3️⃣ Render prompt with article content ----
    const prompt = Mustache.render(PROMPT_TEMPLATE, { articleContent });


    // 4️⃣ Generate next steps ----
    const streamResult = generateNextStepsStreaming2(prompt, { orgId: data.orgId, slug: data.slug, version: data.version, userId: data.userId });

    // 5️⃣ Return stream response ----
    return streamResult.toUIMessageStreamResponse({sendSources: true, sendFinish: true,});

    // 6️⃣ Handle errors ----
  } catch (error) {
    console.error("Failed to generate next steps 2", error);
    return new Response(JSON.stringify({ error: "Failed to generate next steps 2" }), { status: 500 });
  }
}
