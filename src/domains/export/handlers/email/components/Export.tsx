/* ==========================================================================*/
// article-email-export.tsx — Email template for article export functionality
/* ==========================================================================*/
// Purpose: Renders email template when users send articles via email export
// Sections: Imports, Props, Component, Exports

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// React Core ---
import * as React from "react";

/* ==========================================================================*/
// Props Interface
/* ==========================================================================*/

interface ArticleEmailExportProps {
  recipientName: string;
  senderName: string;
  articleHeadline: string;
  articleSlug: string;
  version: string;
  href: string;
  content?: string;
  blobs?: string;
}

/* ==========================================================================*/
// Component
/* ==========================================================================*/

export function ArticleEmailExport({ articleHeadline, articleSlug, version, href, content, blobs }: ArticleEmailExportProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });


  // Format blobs as bullet points
  const formatBlobs = (blobText: string) => {
    if (!blobText) return null;

    const blobItems = blobText
      .split("\n")
      .map((blob) => blob.trim())
      .filter((blob) => blob.length > 0);

    return blobItems.map((blob, index) => (
      <div
        key={index}
        style={{
          margin: "12px 0",
          fontSize: "16px",
          fontWeight: "500",
          color: "#333",
          paddingLeft: "24px",
          textIndent: "-24px",
          lineHeight: "1.5"
        }}
      >
        • {blob}
      </div>
    ));
  };

  return (
    <div style={{ margin: "0", padding: "20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif", backgroundColor: "#f5f7fa", textAlign: "center" }}>
      <div style={{ width: "100%", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ 
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
          padding: "60px 40px",
          margin: "20px auto",
          maxWidth: "580px",
          textAlign: "left",
          display: "inline-block",
          width: "calc(100% - 80px)"
        }}>
          {/* Header */}
          <h1 style={{
            fontSize: "28px",
            fontWeight: "600",
            color: "#333",
            margin: "0 0 32px 0",
            lineHeight: "1.2",
            textAlign: "center"
          }}>
            Someone Shared An Article With You!
          </h1>
          
          {/* Custom message if provided, otherwise just spacing */}
          {content && content.trim() ? (
            <p style={{ margin: "0 0 32px 0", fontSize: "16px", color: "#333", whiteSpace: "pre-wrap", padding: "0", lineHeight: "1.5" }}>
              {content}
            </p>
          ) : (
            <div style={{ margin: "0 0 16px 0" }} />
          )}

          {/* Metadata */}
          <div style={{ margin: "20px 0", paddingTop: "20px", borderTop: "1px solid #e9ecef" }}>
            <div style={{ fontSize: "13px", color: "#666", lineHeight: "1.6" }}>
              <div style={{ margin: "0 0 4px 0" }}>
                <span style={{ fontWeight: "500", color: "#333" }}>Article:</span> {articleSlug}
              </div>
              <div style={{ margin: "0 0 4px 0" }}>
                <span style={{ fontWeight: "500", color: "#333" }}>Version:</span> {version}
              </div>
              <div style={{ margin: "0" }}>
                <span style={{ fontWeight: "500", color: "#333" }}>Exported:</span> {currentDate}
              </div>
            </div>
          </div>

          {/* Article Title */}
          <h2 style={{
            fontSize: "24px",
            fontWeight: "600",
            color: "#333",
            margin: "32px 0 24px 0",
            lineHeight: "1.3"
          }}>
            {articleHeadline}
          </h2>

          {/* Blobs in a styled container */}
          {blobs && blobs.trim() && (
            <div style={{ 
              background: "#f8f9fa",
              border: "2px solid #e9ecef",
              borderRadius: "12px",
              padding: "24px",
              margin: "32px 0"
            }}>
              {formatBlobs(blobs)}
            </div>
          )}

          {/* Article Link */}
          <div style={{ margin: "40px 0 20px 0", textAlign: "center" }}>
            <a
              href={href}
              style={{
                display: "inline-block",
                backgroundColor: "#333",
                color: "white",
                padding: "16px 32px",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "16px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                transition: "all 0.2s ease"
              }}
            >
              View Article Online
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
