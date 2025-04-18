
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { loadCustomFont } from "@/utils/font-utils";
import { toast } from "sonner";

interface FontData {
  name: string;
  file_path: string;
  file_type: string;
}

export const useFonts = () => {
  const [customFonts, setCustomFonts] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadSavedFonts();
  }, []);

  const loadSavedFonts = async () => {
    const { data: fonts, error } = await supabase
      .from('fonts')
      .select('name, file_path');

    if (error) {
      console.error('Error loading fonts:', error);
      toast.error('Không thể tải danh sách font chữ');
      return;
    }

    if (fonts) {
      setCustomFonts(fonts.map(font => font.name));
      
      fonts.forEach(async (font) => {
        const { data: fontUrl } = supabase.storage
          .from('fonts')
          .getPublicUrl(font.file_path);

        if (fontUrl) {
          await loadCustomFont(fontUrl.publicUrl, font.name);
        }
      });
    }
  };

  const uploadFont = async (file: File): Promise<{success: boolean, fontName: string}> => {
    setIsUploading(true);
    try {
      const fontName = file.name.split('.')[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const filePath = `${Date.now()}-${file.name}`;

      // Upload font file to storage
      const { error: uploadError } = await supabase.storage
        .from('fonts')
        .upload(filePath, file);

      if (uploadError) throw new Error(uploadError.message);

      // Get the public URL
      const { data: fontUrl } = supabase.storage
        .from('fonts')
        .getPublicUrl(filePath);

      if (!fontUrl) throw new Error('Could not get font URL');

      // Save font metadata to database
      const { error: dbError } = await supabase
        .from('fonts')
        .insert({
          name: fontName,
          file_path: filePath,
          file_type: fileExtension || 'ttf'
        });

      if (dbError) throw new Error(dbError.message);

      // Load font for immediate use
      await loadCustomFont(fontUrl.publicUrl, fontName);
      
      // Update local state
      setCustomFonts(prev => [...prev, fontName]);

      toast.success(`Đã tải lên phông chữ: ${fontName}`);
      return { success: true, fontName };

    } catch (error) {
      console.error('Error uploading font:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể tải lên phông chữ');
      return { success: false, fontName: '' };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    customFonts,
    isUploading,
    uploadFont,
    loadSavedFonts
  };
};
