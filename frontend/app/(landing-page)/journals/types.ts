export type JournalDiscipline = 'Education' | 'Humanities and Social Sciences' | 'Engineering and Technology' | 'Health and Sciences' | 'Business Education' | 'Public Administration' | 'Other Disciplines';

export interface JournalArticle {
  id: string;
  title: string;
  authors: string[];
  pages: string;
  download_url: string;
}

export interface Journal {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cover_image: string;
  discipline: JournalDiscipline;
  publisher: string;
  issn: string;
  email: string;
  phone: string;
  volume: string;
  issue: string;
  year: number;
  articles: JournalArticle[];
}
