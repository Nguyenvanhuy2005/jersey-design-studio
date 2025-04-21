import React, { useEffect, useRef, useState } from 'react';
import { Logo, PrintConfig, DesignData } from '@/types';
import { loadLogoImages, getFont } from '@/utils/jersey-utils';
import { loadCustomFont } from '@/utils/font-utils';
import { useDragLogos } from '@/components/jersey/useDragLogos';
import { JerseyFront } from '@/components/jersey/JerseyFront';
import { JerseyBack } from '@/components/jersey/JerseyBack';
import { JerseyPants } from '@/components/jersey/JerseyPants';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface CanvasJerseyProps {
  teamName: string;
  playerName?: string;
  playerNumber?: string;
  uniformType?: string;
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
  uniformType = 'player',
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

  const isInteractionDisabled = true;
  const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const canvasWidth = 300;
  const canvasHeight = 300;
  
  const isGoalkeeper = uniformType === 'goalkeeper' || designData?.uniform_type === 'goalkeeper';

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
    console.log('Current logos prop:', logos);
    console.log('Current design data:', designData);
    console.log('Is goalkeeper:', isGoalkeeper);
  }, [logos, designData, isGoalkeeper]);

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
      console.log("Attempting to load logos:", logos.length);

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
    if (!canvas) {
      console.log('Canvas ref not available');
      return;
    }

    console.log(`Setting up canvas with pixel ratio: ${pixelRatio}`);

    canvas.width = canvasWidth * pixelRatio;
    canvas.height = canvasHeight * pixelRatio;

    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    ctx.scale(pixelRatio, pixelRatio);

    ctx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in ctx) {
      (ctx as any).imageSmoothingQuality = 'high';
    }

    if ((printConfig?.customFontUrl && !loadedFont) && 
        !['Arial', 'Times New Roman', 'Helvetica', 'Roboto', 'Open Sans'].includes(printConfig?.font || 'Arial')) {
      console.log('Waiting for custom font to load...');
      setTimeout(() => {
        setLoadedFont(prev => !prev);
      }, 100);
      return;
    }

    console.log(`Rendering jersey view: ${view}, with ${loadedLogos.size} loaded logos, isGoalkeeper: ${isGoalkeeper}`);

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    const effectiveDesignData: Partial<DesignData> = {
      ...designData,
      uniform_type: isGoalkeeper ? 'goalkeeper' : 'player',
      font_text: {
        font: designData?.font_text?.font || designData?.font_text?.font_file || printConfig?.font || 'Arial'
      },
      font_number: {
        font: designData?.font_number?.font || designData?.font_number?.font_file || printConfig?.font || 'Arial'
      }
    };

    console.log('Effective Design Data for Jersey:', {
      designData: effectiveDesignData,
      view: view,
      isGoalkeeper: isGoalkeeper
    });

    if (view === 'front') {
      JerseyFront({
        ctx,
        playerNumber: playerNumber,
        loadedLogos,
        logoPositions,
        logos: logos || [],
        fontFamily: getFont(printConfig),
        numberFontFamily: designData?.font_number?.font || getFont(printConfig),
        highQuality: true,
        selectedLogo: isInteractionDisabled ? null : selectedLogo,
        onLogoMove: isInteractionDisabled ? undefined : handleLogoMove,
        onLogoResize: isInteractionDisabled ? undefined : handleLogoResize,
        onLogoDelete: isInteractionDisabled ? undefined : handleLogoDelete,
        designData: effectiveDesignData,
        isGoalkeeper: isGoalkeeper
      });
    } else if (view === 'back') {
      JerseyBack({
        ctx,
        teamName: designData?.line_3?.content || teamName,
        playerName: designData?.line_1?.content || playerName,
        playerNumber,
        fontFamily: getFont(printConfig),
        designData: effectiveDesignData,
        isGoalkeeper: isGoalkeeper
      });
    } else if (view === 'pants') {
      console.log('Rendering pants view');
      const pantsLogo = logos.find(logo => logo.position === 'pants');
      let logoImage;
      let logoPosition;

      if (pantsLogo && pantsLogo.id && loadedLogos.has(pantsLogo.id)) {
        logoImage = loadedLogos.get(pantsLogo.id);
        logoPosition = logoPositions.get(pantsLogo.id);
      }

      const pantsNumberEnabled = designData?.pants_number?.enabled ?? false;
      console.log('Pants number enabled:', pantsNumberEnabled);

      let pantsNumberFont = effectiveDesignData.font_number?.font 
        || printConfig?.font
        || 'Arial';

      JerseyPants({
        ctx,
        playerNumber,
        fontFamily: pantsNumberFont,
        pants_number_enabled: pantsNumberEnabled,
        logo: logoImage && logoPosition ? {
          image: logoImage,
          position: logoPosition
        } : undefined,
        designData: effectiveDesignData,
        printConfig
      });
    }
  }, [teamName, playerName, playerNumber, loadedLogos, view, logoPositions, logos, printConfig, designData, loadedFont, pixelRatio, selectedLogo, isDragging, isInteractionDisabled, isGoalkeeper]);

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
          cursor: 'default'
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
