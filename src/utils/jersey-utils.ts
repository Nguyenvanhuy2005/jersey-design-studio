
import { Logo, LogoPosition, PrintConfig } from '@/types';

// Default positions for each logo location
export const defaultLogoPositions: Record<LogoPosition, { x: number, y: number }> = {
  'chest_left': { x: 80, y: 60 },
  'chest_right': { x: 220, y: 60 },
  'chest_center': { x: 150, y: 100 },
  'sleeve_left': { x: 30, y: 40 },
  'sleeve_right': { x: 270, y: 40 }
};

export const getFont = (printConfig?: PrintConfig, size: number = 20): string => {
  let fontFamily = printConfig?.font || 'Arial';
  
  // If it's a default font, add fallbacks
  if (['Arial', 'Times New Roman', 'Helvetica', 'Roboto', 'Open Sans'].includes(fontFamily)) {
    return `bold ${size}px ${fontFamily}, sans-serif`;
  } else {
    // For custom fonts, use the loaded font name
    return `bold ${size}px "${fontFamily}", sans-serif`;
  }
};

export const loadLogoImages = (
  logos: Logo[], 
  logoPositions: Map<string, { x: number, y: number }>
): Promise<Map<string, HTMLImageElement>> => {
  return new Promise((resolve) => {
    const logoMap = new Map<string, HTMLImageElement>();
    const positionMap = new Map<string, { x: number, y: number }>(logoPositions);
    
    // If no logos, resolve immediately
    if (logos.length === 0) {
      resolve(logoMap);
      return;
    }
    
    let loadedCount = 0;
    
    logos.forEach(logo => {
      if (!logo.previewUrl) {
        loadedCount++;
        if (loadedCount === logos.length) {
          resolve(logoMap);
        }
        return;
      }
      
      const img = new Image();
      img.src = logo.previewUrl;
      img.onload = () => {
        logoMap.set(logo.id!, img);
        
        // Set initial position if not already set
        if (!positionMap.has(logo.id!)) {
          const defaultPos = defaultLogoPositions[logo.position] || { x: 150, y: 150 };
          positionMap.set(logo.id!, { ...defaultPos });
        }
        
        loadedCount++;
        if (loadedCount === logos.length) {
          resolve(logoMap);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === logos.length) {
          resolve(logoMap);
        }
      };
    });
    
    // In case there are no images to load (edge case)
    if (logos.length === 0) {
      resolve(logoMap);
    }
  });
};
