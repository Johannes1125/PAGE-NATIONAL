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
