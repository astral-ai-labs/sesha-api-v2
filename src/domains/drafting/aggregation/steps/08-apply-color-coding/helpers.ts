import * as cheerio from "cheerio";

/**
 * Convert HTML to Lexical JSON format.
 * @param html - The HTML string to convert.
 * @returns The Lexical JSON string.
 */ 

function convertHtmlToLexicalJSON(html: string): string {
    // Clean up the HTML by removing extra whitespace between tags
    const cleanHtml = html.replace(/>\s+</g, '><').trim();
    
    const $ = cheerio.load(cleanHtml);
  
    const paragraphs = $("p").map((_, p) => {
      const spans = $(p).find("span").map((_, span) => {
        const styleAttr = $(span).attr("style") || "";
        const match = styleAttr.match(/color:\s*([^;]+)/i);
        const color = match ? match[1].trim() : "";
  
        const text = $(span).text().trim();
        
        // Skip empty text nodes
        if (!text) return null;
  
        return {
          detail: 0,
          format: 0,
          mode: "normal",
          style: color ? `color:${color}`: "",
          text: text,
          type: "text",
          version: 1
        };
      }).get().filter(Boolean); // Remove null entries
  
      // Skip empty paragraphs
      if (spans.length === 0) return null;
  
      return {
        children: spans,
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1
      };
    }).get().filter(Boolean); // Remove null entries
  
    return JSON.stringify({
      root: {
        children: paragraphs,
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1
      }
    });
  }
 
export { convertHtmlToLexicalJSON };