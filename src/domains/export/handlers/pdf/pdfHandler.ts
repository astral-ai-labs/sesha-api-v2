/* ==========================================================================*/
// pdfHandler.ts — PDF export handler
/* ==========================================================================*/
// Purpose: Handle article export to PDF format
// Sections: Imports, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Internal Modules ----
import type { ArticleExportDataWithHtml, ExportHandlerResponse } from "../../types";
import { generatePdfHtml, initializeBrowser } from "./_helpers";

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Export article data as PDF file.
 */
async function handleArticleExportAsPdf(exportData: ArticleExportDataWithHtml): Promise<ExportHandlerResponse> {
  // 1️⃣ Generate HTML -----
  const htmlContent = generatePdfHtml(exportData);

  // 2️⃣ Initialize browser -----
  const browser = await initializeBrowser();

  try {
    console.log("📄 Browser launched, creating PDF...");

    const page = await browser.newPage();

    // Set content and wait for it to load
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Generate PDF with proper options
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();
    console.log("✅ PDF generated successfully, size:", pdfBuffer.length);

    // 3️⃣ Generate filename -----
    const sanitizedSlug = exportData.slug.replace(/[^a-zA-Z0-9-_]/g, "_");
    const filename = `${sanitizedSlug}_v${exportData.version}.pdf`;

    console.log("✅ PDF export completed:", filename);

    // 4️⃣ Return PDF file -----
    const response = new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });

    return {
      success: true,
      data: response,
    };

  } catch (error) {
    // Ensure browser is closed on error
    await browser.close();
    return {
      success: false,
      error: error instanceof Error ? error.message : "PDF generation failed",
    };
  }
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { handleArticleExportAsPdf };
