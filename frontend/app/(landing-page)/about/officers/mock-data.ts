export interface Officer {
  name: string;
  position: string;
  category: "National Officers" | "Board of Directors";
  bio: string;
  photo_url: string;
}

export type OfficerCategory = "All" | "National Officers" | "Board of Directors";

export const CATEGORIES: OfficerCategory[] = ["All", "National Officers", "Board of Directors"];

export const OFFICERS_DATA: Officer[] = [
  // National Officers
  {
    name: "Dr. Lino C. Reynoso",
    position: "President",
    category: "National Officers",
    bio: "Leading PAGE with a vision for excellence in graduate education and research administration.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Lino%20Reynoso&backgroundColor=1e5390&textColor=ffffff",
  },
  {
    name: "Dr. Alper V. Pineda",
    position: "Vice President for Luzon",
    category: "National Officers",
    bio: "Championing graduate education initiatives and regional collaborations across Luzon.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Alper%20Pineda&backgroundColor=2d62ae&textColor=ffffff",
  },
  {
    name: "Dr. Remedios C. Bacus",
    position: "Vice President for Visayas",
    category: "National Officers",
    bio: "Fostering research excellence and institutional partnerships throughout the Visayas region.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Remedios%20Bacus&backgroundColor=14b8a6&textColor=ffffff",
  },
  {
    name: "Dr. Judith C. Chavez",
    position: "Vice President for Mindanao",
    category: "National Officers",
    bio: "Advancing graduate programs and academic networking across universities in Mindanao.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Judith%20Chavez&backgroundColor=7c3aed&textColor=ffffff",
  },
  {
    name: "Dr. Arnel D. Bravo",
    position: "Secretary",
    category: "National Officers",
    bio: "Overseeing organizational records, communications, and strategic administrative operations.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Arnel%20Bravo&backgroundColor=ea580c&textColor=ffffff",
  },
  {
    name: "Dr. Ma. Kathleen C. Tiglao",
    position: "Treasurer",
    category: "National Officers",
    bio: "Managing financial resources to sustain and grow PAGE’s national education programs.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Kathleen%20Tiglao&backgroundColor=f43f5e&textColor=ffffff",
  },
  {
    name: "Dr. Rowena R. Abrea",
    position: "Auditor",
    category: "National Officers",
    bio: "Ensuring transparency, accountability, and integrity in all financial undertakings.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Rowena%20Abrea&backgroundColor=0d9488&textColor=ffffff",
  },
  {
    name: "Dr. Dolores T. Quambo",
    position: "Press Relations Officer",
    category: "National Officers",
    bio: "Building strong bridges between PAGE and the public through effective communication.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Dolores%20Quambo&backgroundColor=4b5563&textColor=ffffff",
  },

  // Board of Directors
  {
    name: "Dr. Caridad Q. Abian",
    position: "Board of Director",
    category: "Board of Directors",
    bio: "Contributing strategic insights to shape national graduate education policies.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Caridad%20Abian&backgroundColor=f59e0b&textColor=ffffff",
  },
  {
    name: "Dr. Ramir Austria",
    position: "Board of Director",
    category: "Board of Directors",
    bio: "Guiding institutional collaborations and advanced research methodologies.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Ramir%20Austria&backgroundColor=ec4899&textColor=ffffff",
  },
  {
    name: "Dr. Sonia A. Pajaron",
    position: "Board of Director",
    category: "Board of Directors",
    bio: "Advocating for curriculum innovation and global competitiveness in graduate studies.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Sonia%20Pajaron&backgroundColor=8b5cf6&textColor=ffffff",
  },
  {
    name: "Dr. Joseph G. Recio",
    position: "Board of Director",
    category: "Board of Directors",
    bio: "Supporting the continuous professional development of graduate faculty.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Joseph%20Recio&backgroundColor=3b82f6&textColor=ffffff",
  },
  {
    name: "Dr. Ruy Reyes",
    position: "Board of Director",
    category: "Board of Directors",
    bio: "Driving interdisciplinary research and academic excellence across member institutions.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Ruy%20Reyes&backgroundColor=10b981&textColor=ffffff",
  },
  {
    name: "Dr. Yolanda C. Sayson",
    position: "Board of Director",
    category: "Board of Directors",
    bio: "Ensuring graduate programs align with national development goals.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Yolanda%20Sayson&backgroundColor=ef4444&textColor=ffffff",
  },
  {
    name: "Dr. Imelda P. Soriano",
    position: "Board of Director",
    category: "Board of Directors",
    bio: "Fostering inclusive and sustainable growth in higher education frameworks.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Imelda%20Soriano&backgroundColor=6366f1&textColor=ffffff",
  }
];
