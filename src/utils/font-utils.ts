
export const loadCustomFont = async (fontUrl: string, fontName: string): Promise<FontFace | null> => {
  if (!fontUrl || !fontName) {
    console.warn('Missing fontUrl or fontName for loadCustomFont');
    return null;
  }
  
  try {
    // Check if font is already loaded
    const existingFont = document.fonts.check(`12px "${fontName}"`);
    if (existingFont) {
      console.log(`Font ${fontName} is already loaded`);
      return null;
    }
    
    console.log(`Loading custom font: ${fontName} from ${fontUrl}`);
    const font = new FontFace(fontName, `url(${fontUrl})`);
    const loadedFont = await font.load();
    
    // Add font to document
    document.fonts.add(loadedFont);
    console.log(`Custom font loaded successfully: ${fontName}`);
    
    return loadedFont;
  } catch (error) {
    console.error('Error loading custom font:', error);
    return null;
  }
};

export const getAvailableFonts = (): string[] => {
  // This is a simplified approach; getting all available fonts is complex
  // and not fully supported across browsers
  return [
    'Arial', 
    'Times New Roman', 
    'Helvetica', 
    'Roboto', 
    'Open Sans',
    'Courier New',
    'Verdana',
    'Georgia'
  ];
};

// Check if a system font is available
export const isFontAvailable = (fontName: string): boolean => {
  const testString = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const testSize = '72px';
  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return false;
  
  const getWidth = (font: string): number => {
    context.font = `${testSize} ${font}`;
    return context.measureText(testString).width;
  };
  
  // Get the width using a base font
  const baseFont = baseFonts[0];
  const baseWidth = getWidth(baseFont);
  
  // Try with the specified font and our fallback font
  const testFont = `${fontName}, ${baseFont}`;
  const testWidth = getWidth(testFont);
  
  // If the widths are different, the font is available
  return baseWidth !== testWidth;
};
