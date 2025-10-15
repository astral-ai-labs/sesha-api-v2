/**
 * extractLexicalDisplayText
 *
 * Extracts text from Lexical JSON format exactly as it will be displayed.
 * Parses the JSON structure and extracts all text nodes.
 *
 * @param richContent - Lexical JSON string from Step 8
 * @returns Clean text string that matches Lexical's text content
 */
function extractLexicalDisplayText(richContent: string): string {
  try {
    // Parse Lexical JSON format
    const lexicalData = JSON.parse(richContent);

    const textParts: string[] = [];

    // Recursively extract text from Lexical JSON nodes
    function extractTextFromNode(node: { type?: string; text?: string; children?: unknown[] }): void {
      if (!node) return;

      // If this is a text node, extract the text
      if (node.type === "text" && node.text) {
        textParts.push(node.text);
      }

      // If this node has children, recursively process them
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child) => extractTextFromNode(child as { type?: string; text?: string; children?: unknown[] }));
      }
    }

    // Start extraction from root
    if (lexicalData.root) {
      extractTextFromNode(lexicalData.root);
    }

    // Join with spaces and normalize whitespace
    return textParts.join(" ").replace(/\s+/g, " ").trim();
  } catch (error) {
    console.error("Failed to extract text from Lexical JSON:", error);
    // Return empty string if parsing fails
    return "";
  }
}


export { extractLexicalDisplayText };