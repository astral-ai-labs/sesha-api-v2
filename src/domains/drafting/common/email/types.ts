interface ArticleCompleteEmailRequest {
  to: string[];
  subject: string;
  articleHref: string;
  name: string;
  slug: string;
  version: string;
}

export type { ArticleCompleteEmailRequest };
