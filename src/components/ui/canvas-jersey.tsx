import React, { useEffect, useRef, useState } from 'react';
import { Logo, PrintConfig } from '@/types';
import { loadLogoImages, getFont } from '@/utils/jersey-utils';
import { loadCustomFont } from '@/utils/font-utils';
import { useDragLogos } from '@/components/jersey/useDragLogos';
import { JerseyFront } from '@/components/jersey/JerseyFront';
import { JerseyBack } from '@/components/jersey/JerseyBack';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

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

  // Custom hook for Canva-style logo editing functionality
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
                                  logo.position === 'sleeve_left' ? 30 : 270,
                      y_position: logo.position === 'chest_center' ? 100 : 60,
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
                const defaultPos = logo.position === 'chest_left' ? { x: 80, y: 60 } : 
                                  logo.position === 'chest_right' ? { x: 220, y: 60 } :
                                  logo.position === 'chest_center' ? { x: 150, y: 100 } :
                                  logo.position === 'sleeve_left' ? { x: 30, y: 40 } : 
                                  { x: 270, y: 40 };
                
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
                                          logo.position === 'sleeve_left' ? 30 : 270),
                  y: posData.y_position ?? (logo.position === 'chest_center' ? 100 : 60),
                  scale: posData.scale ?? 1.0
                });
                
                console.log(`Loaded position for logo ${logoId}:`, initialPositions.get(logoId));
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
  
  // Save logo positions to database when they change - with improved error handling
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
          // Skip any non-UUID format IDs
          if (!isValidUUID(logoId)) {
            console.warn(`Skipping save for non-UUID logo ID: ${logoId}`);
            continue;
          }
          
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
            toast.error(`Không thể lưu vị trí logo. Vui lòng thử lại sau.`);
          } else {
            console.log(`Updated position for logo ${logoId}:`, position);
          }
        } catch (err) {
          console.error("Error saving logo position:", err);
          toast.error(`Không thể lưu vị trí logo. Vui lòng thử lại sau.`);
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
    console.log('Selected logo for control buttons:', selectedLogo);
    
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
        onLogoMove: handleLogoMove,
        onLogoResize: handleLogoResize,
        onLogoDelete: handleLogoDelete
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
  }, [teamName, playerName, playerNumber, loadedLogos, view, logoPositions, logos, printConfig, loadedFont, pixelRatio, selectedLogo, isDragging]);

  // Helper function to check if a string is a valid UUID
  function isValidUUID(id: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  // Instructions for logo selection and control
  useEffect(() => {
    if (logos && logos.length > 0 && view === 'front') {
      toast.info(
        "Nhấn vào logo để chọn, kéo để di chuyển, kéo các góc để chỉnh kích thước.",
        { 
          id: "logo-instructions",
          duration: 5000
        }
      );
    }
  }, [logos, view]);

  // Update cursor style based on dragging state
  const getCursorStyle = () => {
    if (!selectedLogo) return 'pointer';
    return isDragging ? 'grabbing' : 'grab';
  };

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        width={canvasWidth * pixelRatio} 
        height={canvasHeight * pixelRatio} 
        className="jersey-canvas mx-auto"
        onMouseDown={startDrag}
        onMouseMove={continueDrag}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          cursor: getCursorStyle()
        }}
      />
      {logos && logos.length > 0 && view === 'front' && (
        <div className="mt-2 text-center bg-yellow-50 p-2 rounded">
          <p className="text-sm text-gray-700">
            Nhấn vào logo để chọn, kéo để di chuyển, kéo các góc để chỉnh kích thước
          </p>
        </div>
      )}
    </div>
  );
}
