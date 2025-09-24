/* ==========================================================================*/
// docxHandler.ts — DOCX export handler
/* ==========================================================================*/
// Purpose: Handle article export to DOCX format
// Sections: Imports, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Internal Modules ----
import type { ArticleExportDataWithHtml, ExportHandlerResponse } from "../../types";
import { generateDocxHtml } from "./_helpers";
import { NextResponse } from "next/server";

// HTMLtoDOCX
import HTMLtoDOCX from "html-to-docx";

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Export article data as DOCX file.
 */
async function handleArticleExportAsDocx(exportData: ArticleExportDataWithHtml): Promise<ExportHandlerResponse> {
  // 1️⃣ Generate HTML -----
  const html = generateDocxHtml(exportData);

  // 2️⃣ Convert HTML to DOCX -----
  const docxBuffer = await HTMLtoDOCX(html, null, {
    footer: true,
    pageNumber: true,
    orientation: "portrait",
  });

  // Validate buffer
  if (!docxBuffer || docxBuffer instanceof ArrayBuffer || (docxBuffer instanceof Blob && docxBuffer.size === 0)) {
    return {
      success: false,
      error: "Generated DOCX buffer is empty",
    };
  }

  // 3️⃣ Return DOCX file -----
  const response = new NextResponse(docxBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${exportData.slug}-v${exportData.version}.docx"`,
      "Content-Length": docxBuffer instanceof Blob ? docxBuffer.size.toString() : (docxBuffer as ArrayBuffer).byteLength.toString(),
    },
  });

  return {
    success: true,
    data: response,
  };
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { handleArticleExportAsDocx };
