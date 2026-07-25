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
