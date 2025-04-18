
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { loadCustomFont } from "@/utils/font-utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface FontData {
  name: string;
  file_path: string;
  file_type: string;
  user_id?: string;
  is_public?: boolean;
}

export const useFonts = () => {
  const [customFonts, setCustomFonts] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    loadSavedFonts();
  }, [user?.id]);

  const loadSavedFonts = async () => {
    if (!user) {
      setCustomFonts([]);
      return;
    }

    // Build the query to get fonts - if admin, get all fonts, otherwise get only public fonts and user's fonts
    let query = supabase.from('fonts').select('name, file_path');
    
    if (!isAdmin) {
      query = query.or(`is_public.eq.true,user_id.eq.${user.id}`);
    }

    const { data: fonts, error } = await query;

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
    if (!user) {
      toast.error("Bạn cần đăng nhập để tải lên font chữ");
      return { success: false, fontName: '' };
    }

    setIsUploading(true);
    try {
      const fontName = file.name.split('.')[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const filePath = `${user.id}/${Date.now()}-${file.name}`;

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

      // Save font metadata to database with user_id
      const { error: dbError } = await supabase
        .from('fonts')
        .insert({
          name: fontName,
          file_path: filePath,
          file_type: fileExtension || 'ttf',
          user_id: user.id,
          is_public: false // Default to private font
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

  // New function to toggle font visibility
  const toggleFontPublic = async (fontName: string, isPublic: boolean) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('fonts')
        .update({ is_public: isPublic })
        .eq('name', fontName)
        .eq('user_id', user.id);
      
      if (error) throw new Error(error.message);
      
      toast.success(`Font "${fontName}" đã được đặt thành ${isPublic ? "công khai" : "riêng tư"}`);
      return true;
    } catch (error) {
      console.error('Error toggling font visibility:', error);
      toast.error('Không thể cập nhật trạng thái của font');
      return false;
    }
  };

  return {
    customFonts,
    isUploading,
    uploadFont,
    loadSavedFonts,
    toggleFontPublic
  };
};
