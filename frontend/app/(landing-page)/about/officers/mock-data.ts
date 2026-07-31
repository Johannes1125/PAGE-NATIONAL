export interface Officer {
  name: string;
  position: string;
  category: "National Officers" | "Board of Directors";
  bio: string;
  photo_url: string;
}

export type OfficerCategory = "All" | "National Officers" | "Board of Directors";

export const CATEGORIES: OfficerCategory[] = ["All", "National Officers", "Board of Directors"];
