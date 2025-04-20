import React, { useEffect, useRef, useState } from 'react';
import { Logo, PrintConfig, DesignData } from '@/types';
import { loadLogoImages, getFont } from '@/utils/jersey-utils';
import { loadCustomFont } from '@/utils/font-utils';
import { useDragLogos } from '@/components/jersey/useDragLogos';
import { JerseyFront } from '@/components/jersey/JerseyFront';
import { JerseyBack } from '@/components/jersey/JerseyBack';
import { JerseyPants } from '@/components/jersey/JerseyPants';
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

interface CanvasJerseyProps {
  teamName: string;
  playerName?: string;
  playerNumber?: string;
  logos?: Logo[];
  printConfig?: PrintConfig;
  designData?: Partial<DesignData>;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

export function CanvasJersey({ 
  teamName, 
  playerName, 
  playerNumber, 
  logos = [], 
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

  const isInteractionDisabled = true;
  const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  const getBaseCanvasSize = () => {
    const viewportWidth = window.innerWidth;
    if (viewportWidth <= 640) {
      return { width: 520, height: 600 }; // Small screens
    } else if (viewportWidth <= 1024) {
      return { width: 600, height: 700 }; // Medium screens
    } else {
      return { width: 640, height: 800 }; // Large screens
    }
  };

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

  useEffect(() => {
    const customFontUrl = designData?.font_text?.font_file || designData?.font_number?.font_file;
    if (customFontUrl) {
      loadCustomFont(customFontUrl, 'Custom Font')
        .then(fontFace => {
          setFontFace(fontFace);
          setLoadedFont(true);
        }).catch(error => {
          console.error("Error loading custom font:", error);
        });
    } else {
      setLoadedFont(true);
    }
  }, [designData, logos, teamName, playerName, playerNumber]);

  useEffect(() => {
    if (logos && logos.length > 0) {
      const initialPositions = new Map<string, { x: number, y: number, scale: number }>();

      const positionKeysMap: Record<string, string> = {
        'chest_left': 'logo_chest_left',
        'chest_right': 'logo_chest_right',
        'chest_center': 'logo_chest_center',
        'sleeve_left': 'logo_sleeve_left',
        'sleeve_right': 'logo_sleeve_right',
        'pants': 'logo_pants'
      };

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

      const fetchLogoPositions = async () => {
        for (const logo of logos) {
          if (logo.id && !initialPositions.has(logo.id)) {
            try {
              let logoId = logo.id;

              if (logoId.startsWith('logo-') || !isValidUUID(logoId)) {
                const { data, error } = await supabase
                  .from('logos')
                  .select('id, file_path')
                  .eq('file_path', logo.file.name)
                  .single();

                if (error || !data) {
                  const newUUID = uuidv4();
                  console.log(`Generated new UUID ${newUUID} for logo ${logoId}`);

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
                    logo.id = newUUID;
                    console.log(`Created and stored new UUID ${newUUID} for logo ${logo.file.name}`);
                  }
                } else {
                  logoId = data.id;
                  logo.id = data.id;
                  console.log(`Found existing UUID ${logoId} for logo ${logo.file.name}`);
                }
              }

              const { data: posData, error: posError } = await supabase
                .from('logos')
                .select('x_position, y_position, scale')
                .eq('id', logoId)
                .single();

              if (posError) {
                console.error(`Error fetching position for logo ${logoId}:`, posError);
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width: baseWidth, height: baseHeight } = getBaseCanvasSize();
    
    canvas.width = baseWidth * pixelRatio;
    canvas.height = baseHeight * pixelRatio;
    
    canvas.style.width = '100%';
    canvas.style.maxWidth = `${baseWidth}px`;
    canvas.style.height = 'auto';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(pixelRatio, pixelRatio);
    ctx.clearRect(0, 0, baseWidth, baseHeight);

    const fontToUse = designData?.font_text?.font 
      ? `"${designData.font_text.font}", sans-serif` 
      : getFont(printConfig);
      
    const numberFontToUse = designData?.font_number?.font 
      ? `"${designData.font_number.font}", sans-serif` 
      : fontToUse;

    // Calculate dimensions for the three sections
    const jerseyWidth = baseWidth * 0.5;
    const jerseyHeight = baseHeight * 0.6;
    const pantsHeight = baseHeight * 0.4;

    // Draw front jersey (left side)
    ctx.save();
    ctx.translate(0, 0);
    const numericPlayerNumber = playerNumber ? parseInt(playerNumber, 10) : undefined;
    
    ctx.scale(0.5, 0.5);
    JerseyFront({
      ctx,
      playerNumber: numericPlayerNumber,
      loadedLogos,
      logoPositions,
      logos,
      fontFamily: fontToUse,
      numberFontFamily: numberFontToUse,
      highQuality: true,
      selectedLogo: null,
      designData
    });

    // Add "Mặt trước" label
    ctx.font = '24px Arial';
    ctx.fillStyle = '#1A1A1A';
    ctx.fillText('Mặt trước', baseWidth * 0.25, 30);
    ctx.restore();

    // Draw back jersey (right side)
    ctx.save();
    ctx.translate(jerseyWidth, 0);
    ctx.scale(0.5, 0.5);
    JerseyBack({
      ctx,
      teamName,
      playerName: designData?.line_1?.content || playerName,
      playerNumber,
      fontFamily: numberFontToUse
    });

    // Add "Mặt sau" label
    ctx.font = '24px Arial';
    ctx.fillStyle = '#1A1A1A';
    ctx.fillText('Mặt sau', baseWidth * 0.75, 30);
    ctx.restore();

    // Draw pants (bottom)
    ctx.save();
    ctx.translate(baseWidth * 0.25, jerseyHeight);
    ctx.scale(0.5, 0.5);

    const pantsLogo = logos.find(logo => logo.position === 'pants');
    let logoImage, logoPosition;

    if (pantsLogo?.id && loadedLogos.has(pantsLogo.id)) {
      logoImage = loadedLogos.get(pantsLogo.id);
      logoPosition = logoPositions.get(pantsLogo.id);
    }

    JerseyPants({
      ctx,
      playerNumber,
      fontFamily: numberFontToUse,
      pants_number_enabled: designData?.pants_number?.enabled ?? false,
      logo: logoImage && logoPosition ? {
        image: logoImage,
        position: logoPosition
      } : undefined
    });

    // Add "Quần" label
    ctx.font = '24px Arial';
    ctx.fillStyle = '#1A1A1A';
    ctx.fillText('Quần', baseWidth * 0.5, -20);
    ctx.restore();

  }, [
    teamName, playerName, playerNumber, loadedLogos, logos, 
    printConfig, designData, loadedFont, pixelRatio, logoPositions
  ]);

  function isValidUUID(id: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  return (
    <div className="relative w-full jersey-canvas-container">
      <canvas 
        ref={canvasRef} 
        className="jersey-canvas"
        id="jersey-design-canvas"
      />
      {logos && logos.length > 0 && (
        <div className="mt-2 text-center bg-yellow-50 p-2 rounded">
          <p className="text-sm text-gray-700">
            Xem trước thiết kế áo với vị trí in cố định
          </p>
        </div>
      )}
    </div>
  );
}
