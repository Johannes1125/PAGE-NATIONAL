export interface VersionUpdate {
  version: string;
  date: string;
  isLatest?: boolean;
  changes: string[];
}

export const VERSION_UPDATES: VersionUpdate[] = [
  {
    version: "v0.3.0-dev",
    date: "August 2026",
    isLatest: true,
    changes: [
      "Added Regional Chapters directory and officer management",
      "Enhanced National Conventions schedule and speakers view",
      "Streamlined Membership application verification workflow",
      "Implemented live administrative activity monitoring and audit logs",
    ],
  },
  {
    version: "v0.2.0-dev",
    date: "July 2026",
    changes: [
      "Added SEC Registration and BIR Certification compliance document viewers",
      "Introduced Constitution and By-Laws (CBL) governance archive",
      "Implemented official PAGE logo iteration history timeline",
    ],
  },
  {
    version: "v0.1.0-dev",
    date: "June 2026",
    changes: [
      "Initial project architecture and core platform setup",
      "Multi-role authentication for Members, Organizations, and Administrators",
      "Real-time messaging system and article submission workflow",
    ],
  },
];
