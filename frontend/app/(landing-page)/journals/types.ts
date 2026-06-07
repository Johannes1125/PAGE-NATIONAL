export type JournalDiscipline = 'Humanities' | 'Social Sciences' | 'Technology' | 'Others';

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
