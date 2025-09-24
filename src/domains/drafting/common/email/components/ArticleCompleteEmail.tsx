/* ==========================================================================*/
// article-complete.tsx — Article completion email component
/* ==========================================================================*/
// Purpose: Renders a styled email notification when an article is completed
// Sections: Imports, Props, Component, Exports

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// React Core ---
import * as React from "react";

/* ==========================================================================*/
// Props Interface
/* ==========================================================================*/

interface ArticleCompleteProps {
  name: string;
  slug: string;
  version: string;
  href: string;
}

/* ==========================================================================*/
// Component
/* ==========================================================================*/

export function ArticleComplete({ name, slug, version, href }: ArticleCompleteProps) {
  return (
    <div style={{ 
      margin: "0", 
      padding: "20px", 
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif", 
      backgroundColor: "#f5f7fa", 
      textAlign: "center" 
    }}>
      <div style={{ width: "100%", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ 
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
          padding: "60px 40px",
          margin: "20px auto",
          maxWidth: "500px",
          textAlign: "center",
          display: "inline-block",
          width: "calc(100% - 80px)"
        }}>
          
          {/* Header */}
          <h1 style={{
            fontSize: "32px",
            fontWeight: "600",
            color: "#333",
            margin: "0 0 16px 0",
            lineHeight: "1.2"
          }}>
            Your Article is Ready!
          </h1>
          
          <p style={{
            fontSize: "16px",
            color: "#666",
            margin: "0 0 40px 0",
            lineHeight: "1.5"
          }}>
            Hi {name}, your article has been completed and is ready for review
          </p>

          {/* Article Info Container */}
          <div style={{ 
            background: "#f8f9fa",
            border: "2px solid #e9ecef",
            borderRadius: "12px",
            padding: "24px",
            margin: "32px 0",
            position: "relative"
          }}>
            <div style={{
              fontSize: "14px",
              color: "#666",
              fontWeight: "500",
              marginBottom: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              Article Details
            </div>
            <div style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#333",
              marginBottom: "8px",
              wordBreak: "break-word"
            }}>
              {slug}
            </div>
            <div style={{
              fontSize: "16px",
              color: "#666",
              fontFamily: "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace"
            }}>
              Version {version}
            </div>
          </div>

          {/* CTA Button */}
          <div style={{ margin: "40px 0 32px 0" }}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                backgroundColor: "#333",
                color: "white",
                fontWeight: "600",
                padding: "16px 32px",
                textAlign: "center",
                fontSize: "16px",
                borderRadius: "8px",
                textDecoration: "none",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                transition: "all 0.2s ease"
              }}
            >
              Review Article
            </a>
          </div>

          {/* Alternative Link */}
          <div style={{
            fontSize: "14px",
            color: "#666",
            margin: "32px 0",
            lineHeight: "1.6"
          }}>
            Or copy this link: <a
              href={href}
              style={{ color: "#333", textDecoration: "underline" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {href}
            </a>
          </div>

          {/* Tip Section */}
          <div style={{
            background: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "8px",
            padding: "16px",
            margin: "32px 0 0 0",
            fontSize: "13px",
            color: "#856404"
          }}>
            <strong>Next Steps:</strong> You can re-run the article with adjustments, make manual edits, or run multiple versions to compare results.
          </div>

          {/* Footer */}
          <div style={{
            marginTop: "40px",
            paddingTop: "32px",
            borderTop: "1px solid #e9ecef",
            fontSize: "12px",
            color: "#999"
          }}>
            This article was generated by your Sesha AI writing assistant.
          </div>
        </div>
      </div>
    </div>
  );
}
