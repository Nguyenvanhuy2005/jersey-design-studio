
import React, { useEffect, useRef, useState } from 'react';
import { Logo, PrintConfig } from '@/types';
import { loadLogoImages, getFont } from '@/utils/jersey-utils';
import { loadCustomFont } from '@/utils/font-utils';
import { useDragLogos } from '@/components/jersey/useDragLogos';
import { JerseyFront } from '@/components/jersey/JerseyFront';
import { JerseyBack } from '@/components/jersey/JerseyBack';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CanvasJerseyProps {
  teamName: string;
  playerName?: string;
  playerNumber?: number;
  logos?: Logo[];
  view: 'front' | 'back';
  printConfig?: PrintConfig;
}

export function CanvasJersey({ 
  teamName, 
  playerName, 
  playerNumber, 
  logos = [], 
  view,
  printConfig
}: CanvasJerseyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedLogos, setLoadedLogos] = useState<Map<string, HTMLImageElement>>(new Map());
  const [logoPositions, setLogoPositions] = useState<Map<string, { x: number, y: number, scale: number }>>(new Map());
  const [loadedFont, setLoadedFont] = useState<boolean>(false);
  const [fontFace, setFontFace] = useState<FontFace | null>(null);
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Device pixel ratio for high-resolution displays
  const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  
  // Canvas dimensions - for high-resolution rendering
  const canvasWidth = 300;
  const canvasHeight = 300;

  // Custom hook for logo dragging and resizing functionality
  const { 
    startDrag, 
    drag, 
    endDrag, 
    handleResize,
    selectedLogo 
  } = useDragLogos({
    logos,
    logoPositions,
    setLogoPositions
  });

  // Debug loaded logos
  useEffect(() => {
    console.log('Current logos prop:', logos);
  }, [logos]);

  // Load custom font if provided
  useEffect(() => {
    if (printConfig?.customFontUrl && printConfig.customFontFile) {
      const fontName = printConfig.customFontFile.name.split('.')[0];
      
      loadCustomFont(printConfig.customFontUrl, fontName)
        .then(loadedFont => {
          if (loadedFont) {
            setFontFace(loadedFont);
            setLoadedFont(true);
          }
        });
    }
  }, [printConfig?.customFontUrl, printConfig?.customFontFile]);

  // Load logos and their positions from database
  useEffect(() => {
    if (logos && logos.length > 0) {
      console.log("Attempting to load logos:", logos.length);
      
      // Initialize positions map with any saved positions from database
      const initialPositions = new Map<string, { x: number, y: number, scale: number }>();
      
      // Fetch saved positions for logos from Supabase
      const fetchLogoPositions = async () => {
        for (const logo of logos) {
          if (logo.id) {
            try {
              const { data, error } = await supabase
                .from('logos')
                .select('x_position, y_position, scale')
                .eq('id', logo.id)
                .single();
              
              if (error) {
                console.error("Error fetching logo position:", error);
                // For non-UUID IDs, we'll just use default positions
                const defaultPos = logo.position === 'chest_left' ? { x: 80, y: 60 } : 
                                logo.position === 'chest_right' ? { x: 220, y: 60 } :
                                logo.position === 'chest_center' ? { x: 150, y: 100 } :
                                logo.position === 'sleeve_left' ? { x: 30, y: 40 } : 
                                { x: 270, y: 40 };
                
                initialPositions.set(logo.id, {
                  x: defaultPos.x,
                  y: defaultPos.y,
                  scale: 1.0
                });
                continue;
              }
              
              if (data) {
                // Use saved position if available, otherwise use defaults
                const defaultPos = logo.position === 'chest_left' ? { x: 80, y: 60 } : 
                                  logo.position === 'chest_right' ? { x: 220, y: 60 } :
                                  logo.position === 'chest_center' ? { x: 150, y: 100 } :
                                  logo.position === 'sleeve_left' ? { x: 30, y: 40 } : 
                                  { x: 270, y: 40 };
                
                initialPositions.set(logo.id, {
                  x: data.x_position ?? defaultPos.x,
                  y: data.y_position ?? defaultPos.y,
                  scale: data.scale ?? 1.0
                });
                
                console.log(`Loaded position for logo ${logo.id}:`, initialPositions.get(logo.id));
              }
            } catch (err) {
              console.error("Error in fetchLogoPositions:", err);
              // Set default position if error occurs
              const defaultPos = logo.position === 'chest_left' ? { x: 80, y: 60 } : 
                              logo.position === 'chest_right' ? { x: 220, y: 60 } :
                              logo.position === 'chest_center' ? { x: 150, y: 100 } :
                              logo.position === 'sleeve_left' ? { x: 30, y: 40 } : 
                              { x: 270, y: 40 };
              
              initialPositions.set(logo.id, {
                x: defaultPos.x,
                y: defaultPos.y,
                scale: 1.0
              });
            }
          }
        }
        
        setLogoPositions(initialPositions);
        
        // Now load the logo images with these positions
        loadLogoImages(logos, initialPositions, true)
          .then(logoMap => {
            console.log(`Successfully loaded ${logoMap.size} logos`);
            if (logoMap.size !== logos.length) {
              console.warn(`Warning: Only ${logoMap.size} out of ${logos.length} logos were loaded`);
            }
            setLoadedLogos(logoMap);
            
            // Auto-select the first logo if only one logo exists
            if (logos.length === 1 && logos[0].id) {
              // Small delay to ensure the canvas is rendered first
              setTimeout(() => {
                console.log("Auto-selecting the only logo:", logos[0].id);
              }, 500);
            }
          })
          .catch(err => {
            console.error("Error loading logos:", err);
          });
      };
      
      fetchLogoPositions();
    } else {
      console.log("No logos to load");
      setLoadedLogos(new Map());
      setLogoPositions(new Map());
    }
  }, [logos]);
  
  // Save logo positions to database when they change
  useEffect(() => {
    // Skip if no logos or positions
    if (logos.length === 0 || logoPositions.size === 0) return;
    
    // Debounce the save operation
    if (saveTimer) {
      clearTimeout(saveTimer);
    }
    
    const timer = setTimeout(async () => {
      console.log("Saving logo positions to database...");
      
      for (const [logoId, position] of logoPositions.entries()) {
        try {
          const { error } = await supabase
            .from('logos')
            .update({
              x_position: position.x,
              y_position: position.y,
              scale: position.scale
            })
            .eq('id', logoId);
          
          if (error) {
            console.error(`Error updating position for logo ${logoId}:`, error);
          } else {
            console.log(`Updated position for logo ${logoId}:`, position);
          }
        } catch (err) {
          console.error("Error saving logo position:", err);
        }
      }
    }, 500); // 500ms debounce
    
    setSaveTimer(timer);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [logoPositions, logos.length]);

  // Configure and render the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('Canvas ref not available');
      return;
    }

    console.log(`Setting up canvas with pixel ratio: ${pixelRatio}`);
    
    // Set the canvas dimensions based on device pixel ratio
    canvas.width = canvasWidth * pixelRatio;
    canvas.height = canvasHeight * pixelRatio;
    
    // Set the display size to maintain visual dimensions
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    // Scale the context to match the device pixel ratio
    ctx.scale(pixelRatio, pixelRatio);
    
    // Enable high-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in ctx) {
      (ctx as any).imageSmoothingQuality = 'high';
    }

    // Only proceed if the custom font is loaded or if no custom font is needed
    if ((printConfig?.customFontUrl && !loadedFont) && 
        !['Arial', 'Times New Roman', 'Helvetica', 'Roboto', 'Open Sans'].includes(printConfig?.font || 'Arial')) {
      console.log('Waiting for custom font to load...');
      // Wait for font to load
      setTimeout(() => {
        // Force a re-render
        setLoadedFont(prev => !prev);
      }, 100);
      return;
    }

    console.log(`Rendering jersey view: ${view}, with ${loadedLogos.size} loaded logos`);
    
    // Clear canvas with proper scaling
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Get the font to use
    const fontToUse = getFont(printConfig);

    // Draw the appropriate jersey view with proper scaling
    if (view === 'front') {
      console.log('Rendering front jersey view');
      // Render front jersey
      JerseyFront({
        ctx,
        playerNumber,
        loadedLogos,
        logoPositions,
        logos: logos || [],
        fontFamily: fontToUse,
        highQuality: true,
        selectedLogo,
        onLogoResize: handleResize
      });
    } else {
      console.log('Rendering back jersey view');
      // Render back jersey
      JerseyBack({
        ctx,
        teamName,
        playerName,
        playerNumber,
        fontFamily: fontToUse
      });
    }
    
  }, [teamName, playerName, playerNumber, loadedLogos, view, logoPositions, logos, printConfig, loadedFont, pixelRatio, selectedLogo]);

  // Instructions for logo drag and resize
  useEffect(() => {
    if (logos && logos.length > 0 && view === 'front') {
      toast.info(
        "You can drag logos to reposition them and use the + and - buttons to resize selected logos. Positions will be saved automatically.",
        { 
          id: "logo-drag-instructions",
          duration: 5000
        }
      );
    }
  }, [logos, view]);

  // Add a more descriptive label for clearer instructions in Vietnamese
  useEffect(() => {
    if (logos && logos.length > 0 && view === 'front') {
      const instructionDiv = document.createElement('div');
      instructionDiv.className = 'mt-2 text-sm text-center text-gray-700';
      instructionDiv.textContent = 'Nhấp vào logo để chọn và hiển thị nút điều chỉnh kích thước.';
      
      const canvas = canvasRef.current;
      if (canvas && canvas.parentNode) {
        // Check if instruction already exists
        const existingInstruction = canvas.parentNode.querySelector('.mt-2.text-sm.text-center');
        if (!existingInstruction) {
          canvas.parentNode.appendChild(instructionDiv);
        }
      }
    }
  }, [logos, view]);

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        width={canvasWidth * pixelRatio} 
        height={canvasHeight * pixelRatio} 
        className="jersey-canvas mx-auto cursor-move"
        onMouseDown={startDrag}
        onMouseMove={drag}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`
        }}
      />
      {logos && logos.length > 0 && view === 'front' && (
        <div className="mt-2 text-center bg-yellow-50 p-2 rounded">
          <p className="text-sm text-gray-700">
            Nhấp vào logo để chọn và hiển thị nút điều chỉnh kích thước (+/-)
          </p>
        </div>
      )}
    </div>
  );
}
