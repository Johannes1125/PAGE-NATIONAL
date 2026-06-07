export interface CBLArticle {
  id: string;
  articleNumber: string;
  title: string;
  sections: string[];
}

export interface CBLData {
  title: string;
  subtitle: string;
  introduction: string;
  pdfUrl: string;
  articles: CBLArticle[];
}

export const CBL_DATA: CBLData = {
  title: "Constitution and By-Laws",
  subtitle: "The governance framework, principles, and rules guiding the operations of PAGE.",
  introduction: "The Constitution and By-Laws (CBL) of the Philippine Association for Graduate Education (PAGE) outlines the fundamental laws, structural framework, and code of conduct governing our national organization. It defines the relationships between regional chapters, the national board, and individual graduate school members.",
  pdfUrl: "/CBL-draft.pdf",
  articles: [
    {
      id: "art-1",
      articleNumber: "Article I",
      title: "Name and Office",
      sections: [
        "Section 1: The name of this organization shall be the Philippine Association for Graduate Education, Inc., hereinafter referred to as the Association or PAGE.",
        "Section 2: The principal office of the Association shall be located in Metro Manila, Philippines, or in such other places as the Board of Directors may from time to time determine."
      ]
    },
    {
      id: "art-2",
      articleNumber: "Article II",
      title: "Objectives",
      sections: [
        "Section 1: To promote and maintain high quality and ethical standards of graduate education in the Philippines.",
        "Section 2: To foster closer relations, cooperation, and mutual understanding among institutions offering graduate programs.",
        "Section 3: To serve as a forum for the discussion of common problems and issues in graduate education.",
        "Section 4: To conduct, support, and publish scholarly research for academic development and policy formulation."
      ]
    },
    {
      id: "art-3",
      articleNumber: "Article III",
      title: "Membership",
      sections: [
        "Section 1: Membership in the Association shall be institutional. Any Philippine higher education institution offering graduate programs accredited or recognized by the Commission on Higher Education (CHED) is eligible for membership.",
        "Section 2: Individual membership may be granted to administrators, professors, and scholars of graduate education as Associate Members, subject to the approval of the Board of Directors."
      ]
    },
    {
      id: "art-4",
      articleNumber: "Article IV",
      title: "The National Board of Directors",
      sections: [
        "Section 1: The governing body of the Association shall be the National Board of Directors, consisting of fifteen (15) members elected in accordance with the By-Laws.",
        "Section 2: The Board of Directors shall have general charge of the property, business, and affairs of the Association, with power to formulate policies and guidelines."
      ]
    },
    {
      id: "art-5",
      articleNumber: "Article V",
      title: "Officers of the Association",
      sections: [
        "Section 1: The officers of the Association shall be a President, a Vice-President, a Secretary, a Treasurer, an Auditor, and a Press Relations Officer, all of whom shall be elected by the Board of Directors from among themselves.",
        "Section 2: Officers shall serve for a term of two (2) years, or until their successors are duly elected and qualified."
      ]
    },
    {
      id: "art-6",
      articleNumber: "Article VI",
      title: "Elections and General Assembly",
      sections: [
        "Section 1: The Annual General Assembly of the Association shall be held during the National Conference, at a time and place designated by the Board of Directors.",
        "Section 2: Election of directors shall be conducted by secret ballot or secure electronic means during the Annual General Assembly."
      ]
    }
  ]
};
