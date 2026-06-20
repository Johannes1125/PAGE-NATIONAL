export interface SymbolBreakdown {
  element: string;
  meaning: string;
}

export interface ColorPaletteEntry {
  color_name: string;
  hex: string;
  significance: string;
}

export interface LogoData {
  title: string;
  subtitle: string;
  symbol_breakdown: SymbolBreakdown[];
  color_palette: ColorPaletteEntry[];
  design_philosophy: string;
}

export const LOGO_DATA: LogoData = {
  title: "Official Seal & Identity",
  subtitle: "Discover the symbols, structural components, and color meanings that make up the official logo of the Philippine Association for Graduate Education—Philippines Inc.",
  symbol_breakdown: [
    {
      element: "The Outer Ring",
      meaning: "Encircles the central emblem and contains the uppercase letters: 'PHILIPPINE ASSOCIATION FOR GRADUATE EDUCATION—PHILIPPINES INC. • 1962', indicating the organization's founding year.",
    },
    {
      element: "The Open Book",
      meaning: "Symbolizes knowledge, educational foundations, and the continuous pursuit of truth through master's and doctoral studies.",
    },
    {
      element: "The Glowing Light Bulb",
      meaning: "Represents innovation, critical thinking, and cognitive enlightenment—key principles in graduate education.",
    },
    {
      element: "The Quill Pen",
      meaning: "Signifies active scholarly research, academic writing, publication, and intellectual contributions.",
    },
    {
      element: "The Laurel Branches",
      meaning: "Two symmetrical branches encircling the central elements, symbolizing academic excellence, achievement, and honor in academia.",
    },
  ],
  color_palette: [
    {
      color_name: "Academic Deep Blue",
      hex: "#1a4b8c",
      significance: "Reflects trust, professionalism, depth of knowledge, research integrity, and institutional stability.",
    },
    {
      color_name: "Pure White",
      hex: "#ffffff",
      significance: "Symbolizes clarity, academic transparency, and high ethical standards in research.",
    },
  ],
  design_philosophy: "The logo of the Philippine Association for Graduate Education—Philippines Inc. features a circular design with a deep blue background and white elements. The outer ring, encircling the central emblem, contains the organization's name in uppercase letters. The text reads: 'PHILIPPINE ASSOCIATION FOR GRADUATE EDUCATION—PHILIPPINES INC. • 1962,' indicating its founding year. At the center of the logo, an open book symbolizes knowledge and academic pursuit. Above the book, a glowing light bulb represents innovation, critical thinking, and enlightenment—key principles in graduate education. To the right of the light bulb, a quill pen signifies scholarly research, writing, and intellectual contributions. Two symmetrical laurel branches encircle the central elements, a traditional symbol of excellence, achievement, and honor in academia. The logo's overall design conveys the organization's commitment to advancing graduate education, research, and professional development in the Philippines.",
};
