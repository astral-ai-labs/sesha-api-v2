import { NextRequest, NextResponse } from "next/server";

// Email Modules ----
import { ExportArticleEmailRequest, ArticleEmailExport } from "@/domains/export/handlers/email";
import { FROM_EMAIL_NAME, resend as resendClient, FROM_EMAIL_ADDRESS } from "@/core/clients/resend";

export async function POST(request: NextRequest) {
  try {
    const body: ExportArticleEmailRequest = await request.json();

    // Validate required fields
    if (!body.to || !body.subject || !body.href) {
      return NextResponse.json({ error: "Missing required fields: to, subject, and href are required" }, { status: 400 });
    }

    // Validate email array
    if (!Array.isArray(body.to) || body.to.length === 0) {
      return NextResponse.json({ error: "to field must be a non-empty array of email addresses" }, { status: 400 });
    }

    console.log("Sending email to: ", body.to);
    console.log("Subject: ", body.subject);
    console.log("Href: ", body.href);
    console.log("Name: ", body.name);
    console.log("Slug: ", body.slug);
    console.log("Version: ", body.version);
    console.log("Content: ", body.content);
    console.log("Blobs: ", body.blobs);

    const emailTemplate = ArticleEmailExport({
      recipientName: body.name,
      senderName: FROM_EMAIL_NAME,
      articleHeadline: body.subject.replace(/^Article Complete: /, "").replace(/ version \d+$/, ""),
      articleSlug: body.slug,
      href: body.href,
      content: body.content,
      version: body.version,
      blobs: body.blobs,
    });

    const { data, error } = await resendClient.emails.send({
      from: FROM_EMAIL_ADDRESS,
      to: body.to,
      subject: body.subject,
      react: emailTemplate,
    });

    if (error) {
      console.log("Error sending email: ", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.log("Error in send email route: ", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
