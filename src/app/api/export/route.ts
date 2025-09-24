/* ==========================================================================*/
// route.ts — Article export API endpoint
/* ==========================================================================*/
// Purpose: Handle article export requests in multiple formats (DOCX, PDF, Email)
// Sections: Imports, Route Handler, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Next.js Core ---
import { NextRequest, NextResponse } from "next/server";

// Internal Modules ----
import { getArticleExportDataBySlugAndVersion } from "@/domains/export/operations";
import type { ArticleExportDataWithHtml, ExportArticleApiRequest, ExportHandlerResponse } from "@/domains/export/types";
import { prepareArticleHtml } from "@/domains/export/utilities";
import { handleArticleExportAsDocx } from "@/domains/export/handlers/docx/docxHandler";
import { handleArticleExportAsPdf } from "@/domains/export/handlers/pdf/pdfHandler";

/* ==========================================================================*/
// Route Handler
/* ==========================================================================*/

export async function POST(request: NextRequest) {
  try {
    // 1️⃣ Validate request -----
    const data: ExportArticleApiRequest = await request.json();

    if (!data.slug?.trim()) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    if (!data.version?.trim()) {
      return NextResponse.json({ error: "Version is required" }, { status: 400 });
    }

    if (!data.format) {
      return NextResponse.json({ error: "Format is required" }, { status: 400 });
    }

    // 2️⃣ Get article export data -----
    const articleExportData = await getArticleExportDataBySlugAndVersion(data.orgId, data.slug, data.version);

    if (!articleExportData) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // 3️⃣ Generate article HTML -----
    const articleHtml = prepareArticleHtml(articleExportData);

    if (!articleHtml) {
      return NextResponse.json({ error: "Article HTML not found" }, { status: 404 });
    }

    // 4️⃣ Create export data with HTML -----
    const exportDataWithHtml: ArticleExportDataWithHtml = {
      ...articleExportData,
      html: articleHtml,
    };

    // 5️⃣ Route to appropriate export handler -----
    let result: ExportHandlerResponse;

    switch (data.format) {
      case "docx":
        result = await handleArticleExportAsDocx(exportDataWithHtml);
        break;
      case "pdf":
        result = await handleArticleExportAsPdf(exportDataWithHtml);
        break;
      case "email":
        // TODO: Implement Email export handler
        return NextResponse.json({ error: "Email export not yet implemented" }, { status: 501 });
      default:
        return NextResponse.json({ error: "Invalid export format" }, { status: 400 });
    }

    // 6️⃣ Handle export result -----
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Export failed" }, { status: 500 });
    }

    return result.data || NextResponse.json({ error: "No data returned" }, { status: 500 });
  } catch (error) {
    console.error("Export request failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Export failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
