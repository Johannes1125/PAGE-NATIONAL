export interface CBLArticle {
  id: string;
  articleNumber: string;
  title: string;
  sections: string[];
}

export interface Signatory {
  name: string;
  title?: string;
  signed: boolean;
  signatureType: "SGD." | "Sgd";
}

export interface CBLData {
  title: string;
  subtitle: string;
  introduction: string;
  pdfUrl: string;
  articles: CBLArticle[];
  resolution: string;
  adoptionDate: string;
  secretary: Signatory;
  attestedBy: Signatory[];
}

export const CBL_DATA: CBLData = {
  title: "Constitution and By-Laws",
  subtitle: "The official governance framework, organizational principles, and rules guiding the operations of PAGE.",
  introduction: "The Constitution and By-Laws (CBL) of the Philippine Association for Graduate Education, Inc. (PAGE) outlines the fundamental laws, structural framework, and code of conduct governing our national organization. It defines the relationships between regional chapters, the national board, and individual graduate school members.",
  pdfUrl: "/CBL-draft.pdf",
  resolution: "NOW THEREFORE, BE IT RESOLVED, AS IT IS HEREBY RESOLVED, THAT upon unanimous vote of all members present, the foregoing corrections be effected and adopted.",
  adoptionDate: "Adopted, this 3rd day of August, 2012.",
  secretary: {
    name: "DR. JULIANA M. LARAYA",
    title: "Secretary",
    signed: true,
    signatureType: "SGD."
  },
  attestedBy: [
    {
      name: "DR. REYNALDO C. CRUZ",
      title: "VP for Luzon (Acting President)",
      signed: true,
      signatureType: "SGD."
    },
    {
      name: "REV. DR. JOSE ANTONIO E. AUREADA, OP",
      title: "Director (Convener – PAGE 50th Foundation Anniversary)",
      signed: true,
      signatureType: "SGD."
    },
    {
      name: "DR. RUBY C. CATALAN",
      title: "VP for Visayas",
      signed: true,
      signatureType: "Sgd"
    },
    {
      name: "DR. DESIDERIO N. NOVENO, JR.",
      title: "VP for Mindanao",
      signed: true,
      signatureType: "Sgd"
    },
    {
      name: "DR. MELCHOR S. JULIANES",
      title: "Treasurer",
      signed: true,
      signatureType: "Sgd"
    },
    {
      name: "DR. AVELINO S. DE CHAVEZ",
      title: "Auditor",
      signed: true,
      signatureType: "Sgd"
    },
    {
      name: "DR. BENJAMIN C. DAYRIT",
      title: "Director",
      signed: true,
      signatureType: "Sgd"
    },
    {
      name: "FR. ANTONIO P. PUEYO, Ed.D",
      title: "Director",
      signed: true,
      signatureType: "Sgd"
    },
    {
      name: "DR. NENITA I. PRADO",
      title: "Director",
      signed: true,
      signatureType: "Sgd"
    },
    {
      name: "DR. NORMA MARIA P. RUTAB",
      title: "PRO",
      signed: true,
      signatureType: "Sgd"
    },
    {
      name: "DR. EPHRAIM K. ESTACION",
      title: "Director",
      signed: true,
      signatureType: "Sgd"
    },
    {
      name: "DR. FLORIZA N. LAPLAP",
      title: "Director",
      signed: true,
      signatureType: "Sgd"
    }
  ],
  articles: [
    {
      id: "art-1",
      articleNumber: "Article I",
      title: "Name",
      sections: [
        "SECTION 1. Name of the Corporation – The name of the Corporation shall be the PHILIPPINE ASSOCIATION FOR GRADUATE EDUCATION, INC., (PAGE), a non-stock, non-profit corporation, hereinafter called the Corporation."
      ]
    },
    {
      id: "art-2",
      articleNumber: "Article II",
      title: "Office and Seal",
      sections: [
        "SECTION 1. Office – The principal office of the Corporation shall be located in Manila Philippines or such other place or places in Metro Manila as may hereinafter be fixed and determined by the Board of Directors.",
        "SECTION 2. Seal – A circular seal with the words “PHILIPPINE ASSOCIATION FOR GRADUATE EDUCATION, INC., Manila, Philippines- 1962” shall be the seal of the Corporation, which shall be in custody of the Treasurer."
      ]
    },
    {
      id: "art-3",
      articleNumber: "Article III",
      title: "Purposes",
      sections: [
        "Section 1. Purposes – The purpose for which this Corporation is formed are as follows:",
        "1. In general it shall be the primary purpose of this Corporation to pursue the quest for quality and excellence in graduate education through encouragement and promotion of development programs, projects and activities in research, scholarship, faculty and staff development, curricular relevance and refinement and other activities conducive to the attainment of graduate education goals.",
        "2. In particular:",
        "• a. To encourage and promote the production and dissemination of basic and functional researches;",
        "• b. To promote scholarship, professional growth, and administrative, supervisory and faculty competence;",
        "• c. To make reciprocally available the library and other research facilities and resources of members through consortium arrangement;",
        "• d. To participate in the solution of educational problems;",
        "• e. To contribute to the attainment of the goals of national development."
      ]
    },
    {
      id: "art-4",
      articleNumber: "Article IV",
      title: "Membership",
      sections: [
        "SECTION 1. Membership – The association classifies its membership into the following categories: (1) Institutional, (2) Individual: a) Regular, b) Associate, and c) Life; and (3) Sustaining members.",
        "1. Institutional members – Colleges, universities, institutes, or institutions of higher learning offering graduate course/s and/or other entities engaged in research.",
        "2. Individual members – Those who are engaged in graduate education or research and those who are no longer actively engaged in graduate education or research but have necessary degree qualification.",
        "These may either be:",
        "• a. Regular members – Those who are holders of at least a doctoral degree and have passed the membership criteria of the Board of Directors.",
        "• b. Associate Members – Those who are holders of at least a Master’s degree and have passed the membership criteria of the Board of Directors of the Regional Chapter to which they belong.",
        "• c. Life Members – Those whose membership is approved by the Board of Directors based on certain criteria and who have paid life membership fees.",
        "3. Sustaining members – These shall include individuals, institutions, enterprises, or associations who are willing to support the association.",
        "SECTION 2. Members in Good Standing - Are those members who are not delinquent in their annual dues.",
        "SECTION 3. Representatives of Institutional Members – Institutional member shall be represented by the Dean of the Graduate School or his representative. In the event that an institution may have more than one graduate school dean, the official delegate or representative shall be appointed by the head of the institution.",
        "SECTION 4. Application for Membership – Application for membership shall be endorsed by the Membership Committee for approval of the PAGE National President.",
        "SECTION 5. Withdrawal of Membership – Any member may withdraw without prejudice to reinstatement, at any time by serving a written notice of his withdrawal to the Corporate Secretary at least six (6) months before the annual or general meeting of the Corporation. He shall not be entitled to any share in the assets of the Corporation but shall be liable to the payment of his unpaid dues, contribution and/or charges.",
        "SECTION 6. Suspension and Expulsion of Member – Any member, institutional, regular or sustaining which/who fails to comply with rules and regulations of the Corporation, violates the provisions of the By-Laws, makes improper and/or illegal use of the name of the Corporation may be suspended for a definite period of time permanently expelled from the Corporation by two-thirds (2/3) vote of all the members of the Board of Directors after a fair hearing has been made."
      ]
    },
    {
      id: "art-5",
      articleNumber: "Article V",
      title: "Privileges, Fees and Dues",
      sections: [
        "SECTION 1. Annual Fees – Annual fees shall be charged for the support of the Corporation, the rates of which shall be determined by the Board of Directors. Institutional members shall be charged according to size of enrolment.",
        "SECTION 2. Additional Assessment – The Board of Directors shall have the power to impose additional or special fees or contributions, which it may deem necessary to maintain the operation and management of the Corporation.",
        "SECTION 3. Allocation of Membership Fees. The proceeds from life, institutional and sustaining membership fees shall be fully remitted to the PAGE National. Proceeds from regular membership fee shall be shared equally between the PAGE regional Chapter in which the regular member is classified. The Regional Chapter keeps the proceeds from associate membership fees.",
        "SECTION 4. Privileges – The members may enjoy the following privileges:",
        "• a. Institutional members shall be entitled to all services and privileges of the Corporation. An institutional member shall be entitled to ten (10) votes if its enrollment is one hundred or more and five (5) votes if its enrollment is less than one hundred.",
        "• b. Regular, Associate and Life members shall be entitled to all services and privileges of the Corporation. Each regular and life member is entitled to one (1) vote. Associate members can neither vote nor be voted upon for any position in the PAGE National Board.",
        "• c. Sustaining members shall be entitled to all services and privileges of the Corporation. However, they can neither vote nor be voted upon for any elective position in the Corporation.",
        "SECTION 5. Membership Card. – Membership Cards for regular, life, and sustaining members shall be issued by PAGE National. Membership cards for associate members shall be issued through the Regional Chapter where the membership fee is paid."
      ]
    },
    {
      id: "art-6",
      articleNumber: "Article VI",
      title: "Board of Directors",
      sections: [
        "SECTION 1. Composition – The general management of the Corporation shall be vested in the Board of Directors of Fifteen (15) members who shall be elected in the annual meeting of the Corporation as provided by these By-Laws; Provided, that Nine (9) Directors shall be elected from Luzon, three (3) Directors from the Visayas and Three (3) Directors from Mindanao.",
        "SECTION 2. Election and Term of Office – The members of the Board may be elected only for a maximum of two (2) terms of three (3) years each.",
        "SECTION 3. Qualification – To qualify for the Board of Directors, a member must have been active and in good standing for the immediate past five (5) years, attended the immediate past two (2) consecutive annual conventions, and had experience in graduate teaching. He should be present during the election.",
        "SECTION 4. Removal - A director may be removed in accordance with the provisions of the Corporation Code of the Philippines and when he failed to attend 50% of the Board meetings within one fiscal year. A removed director cannot run again for directorship within two (2) years after removal. The vacancy shall be filled in by the candidate who garnered the next highest number of votes in the immediately preceding election.",
        "SECTION 5. Vacancies – Any vacancy occurring in the Board of Directors other than removal or expiration of term, may be filled by the candidate who received the next highest number of votes. A director elected to fill a vacancy shall serve for the unexpired term of his predecessor in office.",
        "SECTION 6. Powers – The Board of Directors shall have the management of the business and affairs of the Corporation and such powers and authority as herein provided by these By-Laws or statues of the Philippines conferred upon it. Without prejudice to the general powers herein above conferred, the Board of Directors shall have the following powers:",
        "• a. From time to time to make change in the rules and regulations not inconsistent with law, of these By-Laws for the management of the Corporation’s business and affairs.",
        "• b. To delegate from time to time, any of the powers of the Board, that the Board may lawfully delegate, to any special committee or to any officer or agent and to appoint any person to be an agent of ……",
        "• c. To appoint the officers and employees of the Corporation, fix their compensation, and to suspend or remove them as the interest of the Corporation may require.",
        "• d. To receive, accept, buy, acquire, sell, mortgage and alienate properties and assets of the association.",
        "The Board shall have a complete inventory taken annually of the properties and assets of the association.",
        "The Board shall have its books audited annually and shall submit to the members of the Corporation annually financial reports of receipts and disbursements and assets and liabilities.",
        "SECTION 7. Organizational Meeting – After the election, the elected members of the Board of Directors shall elect among themselves the officers of the Corporation as provided in Article VII hereof;",
        "SECTION 8. Regular Meeting – The Board of Directors shall hold regular quarterly meetings at such particular date, hour or place as the Board may fix;",
        "SECTION 9. Special Meeting – A special meeting of the Board may be called by the President on five (5) day’s notice to each Director either personally or in writing, or on the written request of two (2) directors.",
        "SECTION 10. Place of Meeting – All meetings of the Board shall be held at such place as the President or Board may fix.",
        "SECTION 11. Minutes – Minutes of all meetings of the Board of Directors shall be kept, and carefully preserved as a record of the Corporation at such meeting. The minutes shall contain such entries that may be required by law.",
        "SECTION 12. Quorum – The Directors shall act as a Board, and the individual directors shall have no power as such. A majority of the Directors shall be necessary at all meetings to constitute a quorum for the transaction of any business and every decision of a majority of the quorum duly assembled as a Board shall be valid as a Corporate act."
      ]
    },
    {
      id: "art-7",
      articleNumber: "Article VII",
      title: "Committees",
      sections: [
        "SECTION 1. Executive Committee – An Executive Committee is hereby created which shall possess and exercise any of the lawful powers of the Board of Directors in the management of any business affairs or property of the Association during interval between the meetings of the board of Directors.",
        "The said Committee shall be composed of five members appointed by the Board of Directors from their own number; headed ipso facto by the President as Chairman of the said Committee.",
        "Three (3) members of the said Committee shall constitute a quorum for the transaction of business and said number shall be necessary for a valid Committee Resolution.",
        "The Executive Committee shall keep the record of all meetings and actions of the Committee and such record shall at all times be open to the inspection of any Director.",
        "All acts or resolutions of the Executive Committee shall be reported to the Board of Directors at the next succeeding special or regular meeting of the Board.",
        "The Executive Committee may meet as often at such times and places as the President or any member of the Committee shall so determine.",
        "SECTION 2. Other Committees – The President shall, from time to time, create, with the approval of the Board of Directors, such Committees, as Membership, Program, Publications, Ways and Means and others, as are necessary for the efficient administration and successful operation of the Corporation."
      ]
    },
    {
      id: "art-8",
      articleNumber: "Article VIII",
      title: "Officers",
      sections: [
        "SECTION 1. General – The officers of the Corporation shall consist of a President, three Vice Presidents (for Luzon, Visayas and Mindanao), a Treasurer, a Corporate Secretary, an Auditor and a Public Relations Officer, whose powers and duties shall be as hereinafter provided and as the Board of Directors may fix in conformity with the provisions of these By-Laws. All officers shall be elected to their offices by a majority vote of a quorum of the Board of Directors. Voting is to be done by written secret ballot. To dispense with the secret balloting, two thirds (2/3) of the Board of Directors must express agreement thereto. Two or more offices with compatible functions may be vested in the same person whenever deemed convenient or expedient by a majority vote of the Board of Directors.",
        "SECTION 2. President – The President shall be elected by the Board of Directors from their own number. He shall be the executive officer of the Corporation and shall have the following powers and duties:",
        "• a. Preside at all meetings of the Corporation and Board of Directors;",
        "• b. Exercise general supervision over the affairs of the Corporation;",
        "• c. Carry the representation and act as spokesman of the Board of Directors and of the Corporation whenever proper and necessary;",
        "• d. Execute or put into effect the decision and directives of the Board of Directors;",
        "• e. Exercise any and all other powers and discharge any such duties as may be specified for him in his By-Laws;",
        "• f. Exercise such other powers and perform such other duties as the Board of Directors may from time to time fix or delegate; and",
        "• g. Enjoy such powers and discharge such duties as are customarily attached to the position of the President.",
        "SECTION 3. Vice-President - Three Vice-Presidents shall likewise be elected by the Board of Directors from their own number; for Luzon, Visayas and Mindanao. Each shall promote the objectives of the association and have direct supervision in their respective regions of activities of common interest to PAGE Chapters and member institutions. Each must be working and residing in his respective region.",
        "SECTION 4. Acting President - In case of inability, sickness, absence or other temporary disability of the President, the Vice-President for Luzon shall serve as Acting President.",
        "SECTION 5. Treasurer – The treasurer, who shall be bonded in such amount and surety acceptable to the Board, shall be elected by the Board of Directors from among themselves. He shall have the following powers and duties:",
        "• a. Have custody of, and be responsible for, all the funds of the corporation and keep a complete and accurate record of receipts and disbursements and other financial matters in the corresponding book of accounts of the corporation, and see to it that all disbursements and expenditures are evidenced by appropriate vouchers;",
        "• b. Deposit in the name and to the credit of the Corporation in such bank or banks as may be designated from time to time by the Board of Directors, all funds belonging to the Corporation which may come under his control;",
        "• c. Render an annual statement showing the financial condition of the association on the 31st day of May each year and such other financial report to the Board of Directors of the President as they may from time to time require.",
        "• d. Receive and give receipts for all money paid to the association from any source whatsoever and generally to perform such other duties as may be required by law or prescribed by the Board of Directors or the President.",
        "• e. Render a statement of the financial condition of the Corporation to the meeting of the Board of Directors;",
        "SECTION 6. Corporate Secretary - The Corporate Secretary shall be elected by the Board of Directors from their own number. He shall be a Filipino and resident of the Philippines and shall have the following powers and duties;",
        "• a. He shall act as the Secretary of the meeting of the Board of Directors and of the Corporation;",
        "• b. He shall keep full minutes of the meetings of the Board and of the Corporation;",
        "• c. He shall give, or cause to be given, all notices required by law or by the By-Laws of the Corporation.",
        "SECTION 7. Auditor - The Auditor shall be elected by the Board of Directors from their own number. He shall audit the financial operations of the Corporation and perform such other duties as may be prescribed by the Board of Directors or the President.",
        "SECTION 8. Public Relations Officer – (PRO)- The Public Relations Officer shall be elected by the Board of Directors from their own number. He shall build and maintain sound and productive relations with the educational and other special publics and the public at large so that the association may adapt itself to the environment and interpret itself to society."
      ]
    },
    {
      id: "art-9",
      articleNumber: "Article IX",
      title: "Regional Chapters",
      sections: [
        "SECTION 1. Creation of Regional Chapters – Regional Chapters or offices of the Corporation may be established and organized under the direction of the Board of Directors for the purpose of diffusing and implementing the work of the Corporation throughout the Philippines.",
        "SECTION 2. Regional Chapter Fees and Contributions – The Regional Chapter of the association may assess fees or contributions from the members of the associations who are attached to the chapter. These fees should not be more than those charged for the support of the national office.",
        "The Board of Directors, through the Zonal Vice Presidents, shall exercise general supervision over the activities of all the chapters on regional offices for the purpose of ensuring maximum participation in the affairs and effective operation of the organization.",
        "SECTION 3. By-Laws - Each chapter shall have each own government and shall elect its own officers in accordance with its By-Laws which must conform to the By-Laws of the Corporation. Adoption of such By-Laws require the concurrence of a 2/3 vote of the National Board.",
        "SECTION 4. Official Receipts – All regional chapters use the official receipts of the national office in collecting membership fees."
      ]
    },
    {
      id: "art-10",
      articleNumber: "Article X",
      title: "Meeting of the Members of the Corporation",
      sections: [
        "SECTION 1. Place – All meetings of the members of the Corporation shall be held at the principal office of the Corporation unless written notices of such meeting shall fix another place in the Philippines.",
        "SECTION 2. Annual Meeting – The annual meeting of the members of the Corporation shall be held in the month of February, the date and time of which shall be determined by the Board. The election of the Board of Directors shall take place in the said annual meeting.",
        "Majority of the institutional and of the regular members attending the national assembly or a special meeting called for a particular purpose shall constitute a quorum, except when the law requires for greater number of proportion.",
        "Written notices of the annual or special meeting of the Corporation shall be sent to all members at least ten (10) days before such meeting.",
        "Notices of the annual and special meeting need not be published in the newspapers.",
        "SECTION 3. Special Meeting – Special meeting of the members may be called by the President upon written request of five (5) Directors or upon the request of at least ten (10) active members of the Corporation.",
        "SECTION 4. Minutes - Minutes of all meetings of the members shall be kept and carefully preserved as a record of the Corporation. The minutes shall contain such entries as may be required by law."
      ]
    },
    {
      id: "art-11",
      articleNumber: "Article XI",
      title: "Fiscal Year",
      sections: [
        "SECTION 1. The fiscal year of the corporation shall begin on April 1 and end on March 31."
      ]
    },
    {
      id: "art-12",
      articleNumber: "Article XII",
      title: "Amendments",
      sections: [
        "These by-Laws may be amended, repealed or altered in whole or in part by a majority vote of the members and majority vote of the Board of Directors of the Corporation at annual or special meeting specially called for the purpose."
      ]
    }
  ]
};
