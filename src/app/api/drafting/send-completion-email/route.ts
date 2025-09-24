import { NextRequest, NextResponse } from "next/server";

// Email Modules ----
import { ArticleCompleteEmailRequest, ArticleComplete } from "@/domains/drafting/common/email";
import { resend as resendClient, FROM_EMAIL_ADDRESS } from "@/core/clients/resend";

export async function POST(request: NextRequest) {
  try {
    const body: ArticleCompleteEmailRequest = await request.json();

    // Validate required fields
    if (!body.to || !body.subject || !body.articleHref) {
      return NextResponse.json({ error: "Missing required fields: to, subject, and articleHref are required" }, { status: 400 });
    }

    // Validate email array
    if (!Array.isArray(body.to) || body.to.length === 0) {
      return NextResponse.json({ error: "to field must be a non-empty array of email addresses" }, { status: 400 });
    }

    console.log("Sending completion email to: ", body.to);
    console.log("Subject: ", body.subject);
    console.log("Article Href: ", body.articleHref);
    console.log("Name: ", body.name);
    console.log("Slug: ", body.slug);
    console.log("Version: ", body.version);

    const emailTemplate = ArticleComplete({
      name: body.name,
      slug: body.slug,
      version: body.version,
      href: body.articleHref,
    });

    const { data, error } = await resendClient.emails.send({
      from: FROM_EMAIL_ADDRESS,
      to: body.to,
      subject: body.subject,
      react: emailTemplate,
    });

    if (error) {
      console.log("Error sending completion email: ", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.log("Error in send completion email route: ", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
