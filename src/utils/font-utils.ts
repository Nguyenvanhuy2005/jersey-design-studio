
export const loadCustomFont = async (fontUrl: string, fontName: string): Promise<FontFace | null> => {
  if (!fontUrl || !fontName) {
    return null;
  }
  
  try {
    const font = new FontFace(fontName, `url(${fontUrl})`);
    const loadedFont = await font.load();
    
    // Add font to document
    document.fonts.add(loadedFont);
    console.log(`Custom font loaded: ${fontName}`);
    
    return loadedFont;
  } catch (error) {
    console.error('Error loading custom font:', error);
    return null;
  }
};
