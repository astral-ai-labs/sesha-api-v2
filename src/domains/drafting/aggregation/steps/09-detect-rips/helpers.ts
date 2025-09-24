import * as cheerio from "cheerio";
import { LexicalNode, TextNode, ParagraphNode } from "lexical";

/**
 * extractLexicalDisplayText
 *
 * Extracts text from color-coded HTML exactly as Lexical will display it.
 * Uses the same cheerio parsing logic as Step 8 to ensure text matching consistency.
 *
 * @param colorCodedHtml - HTML with color-coded spans from Step 8
 * @returns Clean text string that matches Lexical's text content
 */
function extractLexicalDisplayText(richContent: string): string {
  try {
    // Parse Lexical JSON format
    const lexicalData = JSON.parse(richContent);
    
    const textParts: string[] = [];
    
    // Extract text from Lexical nodes
    function extractTextFromNode(node: LexicalNode): void {
      if (node instanceof TextNode) {
        textParts.push(node.getTextContent());
      } else if (node instanceof ParagraphNode) {
        node.getChildren().forEach(extractTextFromNode);
      }
    }
    
    // Start extraction from root
    if (lexicalData.root && lexicalData.root.children) {
      lexicalData.root.getChildren().forEach(extractTextFromNode);
    }
    
    return textParts.join(" ").replace(/\s+/g, " ").trim();
  } catch {
    // Fallback: if it's HTML instead of Lexical JSON
    const $ = cheerio.load(richContent);
    const textParts: string[] = [];

    $("p").each((_, p) => {
      const text = $(p).text().trim();
      if (text) {
        textParts.push(text);
      }
    });

    return textParts.join(" ").replace(/\s+/g, " ").trim();
  }
}


export { extractLexicalDisplayText };