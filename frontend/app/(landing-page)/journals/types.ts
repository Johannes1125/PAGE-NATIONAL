export type JournalDiscipline = 'Business' | 'Technology' | 'Education' | 'Social Sciences' | 'Others';

export type JournalAuthor = string;

export interface JournalConventionRef {
  label: string;
  slug: string;
}

export interface Journal {
  id: string;
  title: string;
  authors: JournalAuthor[];
  discipline: JournalDiscipline;
  convention_label: string;
  convention_slug: string;
  year: number;
  abstract: string;
  download_url: string;
  volume: string;
  issue: string;
  page_range: string;
}
