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
import { getArticleContentBySlugAndVersion, generateNextStepsStreaming } from "@/domains/next-steps";
import { formatPrompt, PromptType, readAllPrompts } from "@/core/ai/prompts";

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

    const articleContent = await getArticleContentBySlugAndVersion(data.orgId, data.slug, data.version);
    if (!articleContent) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const prompts = await readAllPrompts("src/domains/next-steps");

    if (!prompts.systemTemplate || !prompts.userTemplate) {
      throw new Error("Required prompts not found");
    }

    const systemPrompt = formatPrompt(prompts.systemTemplate, undefined, PromptType.SYSTEM);
    const userPrompt = formatPrompt(prompts.userTemplate, { article: articleContent }, PromptType.USER);

    if (!systemPrompt || !userPrompt) {
      throw new Error("Failed to format prompts");
    }

    const streamResult = generateNextStepsStreaming(
      systemPrompt, 
      userPrompt,
      { orgId: data.orgId, slug: data.slug, version: data.version, userId: data.userId }
    );
    
    return streamResult.toTextStreamResponse();
  } catch (error) {
    console.error("Failed to generate next steps", error);
    return new Response(JSON.stringify({ error: "Failed to generate next steps" }), { status: 500 });
  }
}
