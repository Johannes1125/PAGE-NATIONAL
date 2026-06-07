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
  subtitle: "Discover the symbols, structural components, and color meanings that make up the official seal of the Philippine Association for Graduate Education.",
  symbol_breakdown: [
    {
      element: "The Circular Seal",
      meaning: "Represents unity, institutional cohesion, and the continuous, unbroken pursuit of academic advancement since the association's founding in 1962.",
    },
    {
      element: "The Open Book",
      meaning: "Symbolizes foundational knowledge, rigorous scholarly research, and the pursuit of truth through master's and doctoral level studies.",
    },
    {
      element: "The Light Bulb",
      meaning: "Represents innovation, cognitive enlightenment, the spark of new ideas, and the intellectual growth fostered by graduate institutions.",
    },
    {
      element: "The Four-Pointed Star (Polaris)",
      meaning: "Acts as a guiding star, symbolizing academic direction, high quality standards, and guidance for graduate schools in national and global contexts.",
    },
    {
      element: "The Feather Quill",
      meaning: "Stands for active scholarship, academic writing, publication, and the creative dissemination of new peer-reviewed findings.",
    },
    {
      element: "The Laurel Wreaths",
      meaning: "Flanking the central emblems, they symbolize excellence, honor, academic distinction, and the high achievements of the association's member institutions.",
    },
  ],
  color_palette: [
    {
      color_name: "Academic Deep Navy Blue",
      hex: "#0c2340",
      significance: "Reflects trust, professionalism, depth of knowledge, research integrity, and institutional stability.",
    },
    {
      color_name: "Pure White",
      hex: "#ffffff",
      significance: "Symbolizes clarity, academic transparency, open access to publications, and high ethical standards in research.",
    },
    {
      color_name: "Light Blue Accent",
      hex: "#e8eef8",
      significance: "Used as a soft supporting color, representing modern adaptability, digital research networks, and a forward-looking perspective.",
    },
  ],
  design_philosophy: "The official PAGE seal serves as a visual testament to the association's mission. Founded in 1962, the organization encapsulates its key pillars—knowledge, guidance, writing, and innovation—within a unified circular layout. The high contrast between academic deep navy and clean white emphasizes professionalism and ethical clarity, while the classic symbols of the quill, book, star, and wreaths honor the long tradition of scholarly excellence in Philippine graduate schools.",
};
