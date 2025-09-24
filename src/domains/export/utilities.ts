/* ==========================================================================*/
// utilities.ts — Export utility functions
/* ==========================================================================*/
// Purpose: Helper functions for article export processing
// Sections: Imports, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// External Packages ---
import { $generateHtmlFromNodes } from "@lexical/html";
import { createEditor, ParagraphNode } from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";

// Internal Modules ----
import type { ArticleExportData } from "./types";

// Server-side DOM Setup ---
import { JSDOM } from "jsdom";

// Initialize JSDom for server-side Lexical operations
// Lexical's $generateHtmlFromNodes requires a DOM environment to function properly
// In Node.js server context, we need to provide window and document globals
const dom = new JSDOM();
global.window = dom.window as unknown as Window & typeof globalThis;
global.document = dom.window.document;

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Converts article content to HTML string.
 */
function prepareArticleHtml(exportData: ArticleExportData): string | undefined {
  // 1️⃣ Try rich content first -----
  if (exportData.rawRichContent) {
    try {
      // Create editor with necessary nodes
      const editor = createEditor({
        nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, ParagraphNode],
      });

      // Parse and convert to HTML
      const importedState = editor.parseEditorState(exportData.rawRichContent);
      editor.setEditorState(importedState);

      let html = editor.read(() => {
        return $generateHtmlFromNodes(editor, null);
      });

      // Strip newlines for single source articles
      if (exportData.draftType === "digest") {
        html = html.replace(/<\/p>\s*\n+/g, "</p>");
      }

      return html;
    } catch (error) {
      console.error("Error converting richContent to HTML:", error);
      // Fall through to rawContent
    }
  }

  // 2️⃣ Fallback to plain content -----
  if (exportData.rawContent) {
    let content = exportData.rawContent;

    // Strip newlines for single source articles
    if (exportData.draftType === "digest") {
      content = content.replace(/<\/p>\s*\n+/g, "</p>");
    }

    // Convert plain text to paragraphs if needed
    if (!content.includes("<p>") && !content.includes("<div>")) {
      content = content
        .split(/\n\s*\n/)
        .filter((para) => para.trim())
        .map((para) => `<p>${para.trim()}</p>`)
        .join("");
    }

    return `<div>${content}</div>`;
  }

  // 3️⃣ No content available -----
  return undefined;
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { prepareArticleHtml };
