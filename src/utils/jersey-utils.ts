import { Logo, LogoPosition, PrintConfig } from '@/types';

// Default positions for each logo location
export const defaultLogoPositions: Record<LogoPosition, { x: number, y: number }> = {
  'chest_left': { x: 80, y: 60 },
  'chest_right': { x: 220, y: 60 },
  'chest_center': { x: 150, y: 100 },
  'sleeve_left': { x: 30, y: 40 },
  'sleeve_right': { x: 270, y: 40 },
  'pants_left': { x: 70, y: 200 },
  'pants_right': { x: 230, y: 200 }
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
  logoPositions: Map<string, { x: number, y: number, scale: number }>,
  highQuality: boolean = false
): Promise<Map<string, HTMLImageElement>> => {
  return new Promise((resolve) => {
    const logoMap = new Map<string, HTMLImageElement>();
    const positionMap = new Map<string, { x: number, y: number, scale: number }>(logoPositions);
    
    // If no logos, resolve immediately
    if (logos.length === 0) {
      resolve(logoMap);
      return;
    }
    
    let loadedCount = 0;
    
    logos.forEach(logo => {
      if (!logo.previewUrl) {
        console.log('Logo missing previewUrl:', logo);
        loadedCount++;
        if (loadedCount === logos.length) {
          resolve(logoMap);
        }
        return;
      }
      
      const img = new Image();
      
      // Debug logo URL
      console.log('Loading logo from URL:', logo.previewUrl);
      
      // Set image attributes for high quality
      img.onload = () => {
        console.log('Logo loaded successfully:', logo.position, img.width, 'x', img.height);
        logoMap.set(logo.id!, img);
        
        // Set initial position if not already set
        if (!positionMap.has(logo.id!)) {
          const defaultPos = defaultLogoPositions[logo.position] || { x: 150, y: 150 };
          positionMap.set(logo.id!, { 
            x: defaultPos.x, 
            y: defaultPos.y,
            scale: 1.0 
          });
        }
        
        loadedCount++;
        if (loadedCount === logos.length) {
          console.log('All logos loaded, total:', logoMap.size);
          resolve(logoMap);
        }
      };
      
      img.onerror = (e) => {
        console.error(`Failed to load logo image: ${logo.previewUrl}`, e);
        
        // Try an alternative approach for blob URLs that may be causing issues
        if (logo.previewUrl.startsWith('blob:') && logo.file) {
          console.log('Trying alternative method with FileReader for blob URL');
          const reader = new FileReader();
          reader.onload = function(e) {
            if (e.target?.result) {
              const newImg = new Image();
              newImg.src = e.target.result as string;
              newImg.onload = () => {
                console.log('Logo loaded via FileReader:', logo.position);
                logoMap.set(logo.id!, newImg);
                loadedCount++;
                if (loadedCount === logos.length) {
                  console.log('All logos loaded, total:', logoMap.size);
                  resolve(logoMap);
                }
              };
              newImg.onerror = () => {
                console.error('Even FileReader approach failed for logo');
                loadedCount++;
                if (loadedCount === logos.length) {
                  resolve(logoMap);
                }
              };
            } else {
              loadedCount++;
              if (loadedCount === logos.length) {
                resolve(logoMap);
              }
            }
          };
          reader.readAsDataURL(logo.file);
        } else {
          loadedCount++;
          if (loadedCount === logos.length) {
            resolve(logoMap);
          }
        }
      };
      
      // Use cached version parameter to avoid browser caching
      if (highQuality && !logo.previewUrl.startsWith('blob:')) {
        img.src = `${logo.previewUrl}?quality=high&t=${Date.now()}`;
      } else {
        img.src = logo.previewUrl;
      }
      
      // Use crossOrigin for CORS if needed (for Supabase storage)
      if (!logo.previewUrl.startsWith('blob:') && !logo.previewUrl.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
    });
    
    // In case there are no images to load (edge case)
    if (logos.length === 0) {
      resolve(logoMap);
    }
  });
};
