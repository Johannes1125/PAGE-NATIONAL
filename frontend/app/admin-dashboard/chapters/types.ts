export interface Officer {
  id: string;
  name: string;
  role: string;
  term: string;
  avatarUrl?: string;
}

export interface Chapter {
  id: string;
  name: string;
  islandGroup: "Luzon" | "Visayas" | "Mindanao";
  region: string;
  description: string;
  status: "published" | "draft" | "archived";
  officers: Officer[];
  createdAt: string;
  updatedAt: string;
}
