
import React, { useEffect, useRef, useState } from 'react';
import { Logo, PrintConfig, DesignData } from '@/types';
import { loadLogoImages, getFont } from '@/utils/jersey-utils';
import { loadCustomFont } from '@/utils/font-utils';
import { useDragLogos } from '@/components/jersey/useDragLogos';
import { JerseyFront } from '@/components/jersey/JerseyFront';
import { JerseyBack } from '@/components/jersey/JerseyBack';
import { JerseyPants } from '@/components/jersey/JerseyPants';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface CanvasJerseyProps {
  teamName: string;
  playerName?: string;
  playerNumber?: number;
  logos?: Logo[];
  view: 'front' | 'back' | 'pants';
  printConfig?: PrintConfig;
  designData?: Partial<DesignData>;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

export function CanvasJersey({ 
  teamName, 
  playerName, 
  playerNumber, 
  logos = [], 
  view,
  printConfig,
  designData,
  canvasRef: externalCanvasRef
}: CanvasJerseyProps) {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalCanvasRef || internalCanvasRef;
  
  const [loadedLogos, setLoadedLogos] = useState<Map<string, HTMLImageElement>>(new Map());
  const [logoPositions, setLogoPositions] = useState<Map<string, { x: number, y: number, scale: number }>>(new Map());
  const [loadedFont, setLoadedFont] = useState<boolean>(false);
  const [fontFace, setFontFace] = useState<FontFace | null>(null);
  
  // Disable logo interaction - the preview is now view-only
  const isInteractionDisabled = true;
  
  // Device pixel ratio for high-resolution displays
  const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  
  // Canvas dimensions - for high-resolution rendering
  const canvasWidth = 300;
  const canvasHeight = 300;

  // Custom hook for logo editing functionality - but we'll disable it
  const { 
    selectedLogo,
    isDragging,
    startDrag, 
    continueDrag,
    endDrag,
    handleLogoMove,
    handleLogoResize,
    handleLogoDelete
  } = useDragLogos({
    logos,
    logoPositions,
    setLogoPositions
  });

  // Debug loaded logos
  useEffect(() => {
    console.log('Current logos prop:', logos);
    console.log('Current design data:', designData);
  }, [logos, designData]);

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
    
    if (designData?.font_text?.font_file) {
      loadCustomFont(designData.font_text.font_file, designData.font_text.font)
        .then(loadedFont => {
          if (loadedFont) {
            setFontFace(loadedFont);
            setLoadedFont(true);
          }
        });
    }
  }, [printConfig?.customFontUrl, printConfig?.customFontFile, designData?.font_text]);

  // Load logos and their positions from database or from designData
  useEffect(() => {
    if (logos && logos.length > 0) {
      console.log("Attempting to load logos:", logos.length);
      
      // Initialize positions map with any saved positions from database or designData
      const initialPositions = new Map<string, { x: number, y: number, scale: number }>();
      
      const positionKeysMap: Record<string, string> = {
        'chest_left': 'logo_chest_left',
        'chest_right': 'logo_chest_right',
        'chest_center': 'logo_chest_center',
        'sleeve_left': 'logo_sleeve_left',
        'sleeve_right': 'logo_sleeve_right',
        'pants': 'logo_pants'
      };
      
      // First check if we have positions in designData
      if (designData) {
        logos.forEach(logo => {
          if (logo.id) {
            const positionKey = positionKeysMap[logo.position];
            const positionData = designData[positionKey as keyof DesignData] as any;
            
            if (positionData && positionData.x_position !== undefined && positionData.y_position !== undefined) {
              initialPositions.set(logo.id, {
                x: positionData.x_position,
                y: positionData.y_position,
                scale: positionData.scale || 1.0
              });
            }
          }
        });
      }
      
      // Fetch saved positions from Supabase for any logos without positions
      const fetchLogoPositions = async () => {
        for (const logo of logos) {
          if (logo.id && !initialPositions.has(logo.id)) {
            try {
              // Extract UUID from logo.id if it's not already a UUID
              let logoId = logo.id;
              
              // If the logo ID contains non-UUID format (like logo-timestamp-random)
              // Generate a new UUID for it and map it to this logo
              if (logoId.startsWith('logo-') || !isValidUUID(logoId)) {
                // Check if we already have this logo mapped to a UUID
                const { data, error } = await supabase
                  .from('logos')
                  .select('id, file_path')
                  .eq('file_path', logo.file.name)
                  .single();
                
                if (error || !data) {
                  // If no mapping exists, create a new one
                  const newUUID = uuidv4();
                  console.log(`Generated new UUID ${newUUID} for logo ${logoId}`);
                  
                  // Store the mapping in Supabase
                  const { error: insertError } = await supabase
                    .from('logos')
                    .insert({
                      id: newUUID,
                      file_path: logo.file.name,
                      position: logo.position,
                      x_position: logo.position === 'chest_left' ? 80 : 
                                  logo.position === 'chest_right' ? 220 : 
                                  logo.position === 'chest_center' ? 150 :
                                  logo.position === 'sleeve_left' ? 30 :
                                  logo.position === 'pants' ? 195 : 270,
                      y_position: logo.position === 'chest_center' ? 100 : 
                                  logo.position === 'pants' ? 100 : 60,
                      scale: 1.0
                    });
                  
                  if (insertError) {
                    console.error("Error creating logo mapping:", insertError);
                  } else {
                    logoId = newUUID;
                    // Update the logo.id with the UUID for this session
                    logo.id = newUUID;
                    console.log(`Created and stored new UUID ${newUUID} for logo ${logo.file.name}`);
                  }
                } else {
                  // Use the existing UUID mapping
                  logoId = data.id;
                  logo.id = data.id; // Update the logo.id with the UUID
                  console.log(`Found existing UUID ${logoId} for logo ${logo.file.name}`);
                }
              }
              
              // Now fetch position data using the UUID
              const { data: posData, error: posError } = await supabase
                .from('logos')
                .select('x_position, y_position, scale')
                .eq('id', logoId)
                .single();
              
              if (posError) {
                console.error(`Error fetching position for logo ${logoId}:`, posError);
                // Set default position if error occurs
                const defaultPos = logo.position === 'chest_left' ? { x: 80, y: 50 } : 
                                  logo.position === 'chest_right' ? { x: 220, y: 50 } :
                                  logo.position === 'chest_center' ? { x: 150, y: 100 } :
                                  logo.position === 'sleeve_left' ? { x: 30, y: 50 } :
                                  logo.position === 'pants' ? { x: 195, y: 100 } :
                                  { x: 270, y: 50 };
                
                initialPositions.set(logoId, {
                  x: defaultPos.x,
                  y: defaultPos.y,
                  scale: 1.0
                });
                continue;
              }
              
              if (posData) {
                // Use saved position if available
                initialPositions.set(logoId, {
                  x: posData.x_position ?? (logo.position === 'chest_left' ? 80 : 
                                          logo.position === 'chest_right' ? 220 : 
                                          logo.position === 'chest_center' ? 150 :
                                          logo.position === 'sleeve_left' ? 30 : 
                                          logo.position === 'pants' ? 195 : 270),
                  y: posData.y_position ?? (logo.position === 'chest_center' ? 100 : 
                                          logo.position === 'pants' ? 100 : 50),
                  scale: posData.scale ?? 1.0
                });
                
                console.log(`Loaded position for logo ${logoId}:`, initialPositions.get(logoId));
              }
            } catch (err) {
              console.error("Error in fetchLogoPositions:", err);
              // Set default position if error occurs
              const defaultPos = logo.position === 'chest_left' ? { x: 80, y: 50 } : 
                              logo.position === 'chest_right' ? { x: 220, y: 50 } :
                              logo.position === 'chest_center' ? { x: 150, y: 100 } :
                              logo.position === 'sleeve_left' ? { x: 30, y: 50 } :
                              logo.position === 'pants' ? { x: 195, y: 100 } : 
                              { x: 270, y: 50 };
              
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
    const fontToUse = designData?.font_text?.font 
      ? `bold 20px "${designData.font_text.font}", sans-serif` 
      : getFont(printConfig);
      
    const numberFontToUse = designData?.font_number?.font 
      ? `bold 20px "${designData.font_number.font}", sans-serif` 
      : fontToUse;

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
        numberFontFamily: numberFontToUse,
        highQuality: true,
        selectedLogo: isInteractionDisabled ? null : selectedLogo,
        onLogoMove: isInteractionDisabled ? undefined : handleLogoMove,
        onLogoResize: isInteractionDisabled ? undefined : handleLogoResize,
        onLogoDelete: isInteractionDisabled ? undefined : handleLogoDelete,
        designData
      });
    } else if (view === 'back') {
      console.log('Rendering back jersey view');
      // Render back jersey
      JerseyBack({
        ctx,
        teamName: designData?.line_3?.content || teamName,
        playerName: designData?.line_1?.content || playerName,
        playerNumber,
        fontFamily: fontToUse
      });
    } else if (view === 'pants') {
      console.log('Rendering pants view');
      // Find pants logo if available
      const pantsLogo = logos.find(logo => logo.position === 'pants');
      let logoImage;
      let logoPosition;
      
      if (pantsLogo && pantsLogo.id && loadedLogos.has(pantsLogo.id)) {
        logoImage = loadedLogos.get(pantsLogo.id);
        logoPosition = logoPositions.get(pantsLogo.id);
      }
      
      // Render pants
      JerseyPants({
        ctx,
        playerNumber,
        fontFamily: numberFontToUse,
        logo: logoImage && logoPosition ? {
          image: logoImage,
          position: logoPosition
        } : undefined
      });
    }
  }, [teamName, playerName, playerNumber, loadedLogos, view, logoPositions, logos, printConfig, designData, loadedFont, pixelRatio, selectedLogo, isDragging, isInteractionDisabled]);

  // Helper function to check if a string is a valid UUID
  function isValidUUID(id: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        width={canvasWidth * pixelRatio} 
        height={canvasHeight * pixelRatio} 
        className="jersey-canvas mx-auto"
        id="jersey-design-canvas"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          cursor: 'default' // Default cursor instead of interaction cursor
        }}
      />
      {logos && logos.length > 0 && (view === 'front' || view === 'pants') && (
        <div className="mt-2 text-center bg-yellow-50 p-2 rounded">
          <p className="text-sm text-gray-700">
            Xem trước thiết kế áo với vị trí in cố định
          </p>
        </div>
      )}
    </div>
  );
}
