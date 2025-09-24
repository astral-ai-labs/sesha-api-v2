/* ==========================================================================*/
// Helper Functions
/* ==========================================================================*/

import { ArticleExportDataWithHtml } from "../../types";

/**
 * formatBlobsAsHtml
 *
 * Converts blob text to HTML bullet points with exact styling match
 */
function formatBlobsAsHtml(blobText: string): string {
  if (!blobText) return "";

  const blobItems = blobText
    .split("\n")
    .map((blob) => blob.trim())
    .filter((blob) => blob.length > 0);

  if (blobItems.length === 0) return "";

  return `<div style="margin-top: 0pt; margin-bottom: 18pt;">
  <ul style="font-family: Times New Roman; font-size: 12pt; margin: 0; padding-left: 0; list-style-position: inside;">
  ${blobItems.map((blob) => `<li style="margin: 3pt 0;"><strong>${blob}</strong></li>`).join("")}
  </ul>
  </div>`;
}

/**
 * generateDocxHtml
 *
 * Creates HTML that exactly matches current docx library styling
 */
function generateDocxHtml(data: ArticleExportDataWithHtml): string {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const blobsHtml = data.blobs ? formatBlobsAsHtml(data.blobs) : "";

  return `<!DOCTYPE html>
  <html>
  <head>
  <meta charset="utf-8">
  <style>
  body { 
    font-family: Times New Roman, serif; 
    font-size: 12pt;
    line-height: 1.2;
    margin: 72pt 90pt 72pt 90pt;
    color: black;
  }
  .metadata { 
    font-family: Times New Roman, serif;
    font-size: 11pt; 
    margin-bottom: 24pt;
    text-decoration: underline;
  }
  .title { 
    font-size: 18pt; 
    font-weight: bold; 
    text-align: center;
    margin: 12pt 0;
  }
  .content {
    margin-top: 18pt;
  }
  /* Spacer paragraph styles in CSS */
  .content p {
    margin: 8pt 0;
  }
  strong, b { font-weight: bold; }
  em, i { font-style: italic; }
  u { text-decoration: underline; }
  ul { margin: 6pt 0; padding-left: 0; list-style-position: inside; }
  li { margin: 3pt 0; }
  </style>
  </head>
  <body>
  <p style="font-family: Times New Roman, serif; font-size: 11pt; margin-bottom: 0pt;"><u><strong>Slug:</strong> ${data.slug} <strong>Version:</strong> ${data.version} <strong>Export by:</strong> sesha systems <strong>on:</strong> ${currentDate}</u></p>
    
    <h1 style="font-size: 18pt; font-weight: bold; text-align: center; margin: 12pt 0 0 0;">${data.headline}</h1>
    
    <p style="font-size:1pt; line-height:1pt; margin:0 0 24pt 0;">&nbsp;</p>
    <p style="font-size:1pt; line-height:1pt; margin:0 0 24pt 0;">&nbsp;</p>
    
    ${blobsHtml}
    
    <p style="font-size:1pt; line-height:1pt; margin:0 0 24pt 0;">&nbsp;</p>
    <p style="font-size:1pt; line-height:1pt; margin:0 0 24pt 0;">&nbsp;</p>
    
    <div class="content">
  ${data.html}
  </div>
  </body>
  </html>`;
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { generateDocxHtml };
