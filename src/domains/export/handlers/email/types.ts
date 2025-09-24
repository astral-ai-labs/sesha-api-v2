
interface ExportArticleEmailRequest {
  to: string[];
  subject: string;
  href: string;
  name: string;
  slug: string;
  version: string;
  content?: string;
  blobs?: string;
}


export type { ExportArticleEmailRequest };