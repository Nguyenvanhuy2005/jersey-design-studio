
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { loadCustomFont } from "@/utils/font-utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface FontData {
  name: string;
  file_path: string;
  file_type: string;
}

interface FontWithPermissions extends FontData {
  user_id?: string | null;
  is_public?: boolean;
}

export const useFonts = () => {
  const [customFonts, setCustomFonts] = useState<string[]>([]);
  const [fontsWithMetadata, setFontsWithMetadata] = useState<FontWithPermissions[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    loadSavedFonts();
  }, [user?.id]);

  const loadSavedFonts = async () => {
    if (!user) {
      setCustomFonts([]);
      setFontsWithMetadata([]);
      return;
    }

    // Build the query to get fonts - for now, get all fonts
    // Once the database is updated with user_id and is_public columns,
    // we'll filter by those
    const { data: fonts, error } = await supabase
      .from('fonts')
      .select('name, file_path, file_type');

    if (error) {
      console.error('Error loading fonts:', error);
      toast.error('Không thể tải danh sách font chữ');
      return;
    }

    if (fonts) {
      // Convert to FontWithPermissions type
      const enhancedFonts: FontWithPermissions[] = fonts.map(font => ({
        ...font,
        // Since these columns don't exist yet, we'll set default values
        user_id: user.id, // Temporarily assign current user as owner
        is_public: true    // Temporarily mark all fonts as public
      }));
      
      setCustomFonts(fonts.map(font => font.name));
      setFontsWithMetadata(enhancedFonts);
      
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

      // Save font metadata to database (with existing columns only)
      const { error: dbError } = await supabase
        .from('fonts')
        .insert({
          name: fontName,
          file_path: filePath,
          file_type: fileExtension || 'ttf',
        });

      if (dbError) throw new Error(dbError.message);

      // Load font for immediate use
      await loadCustomFont(fontUrl.publicUrl, fontName);
      
      // Update local state
      setCustomFonts(prev => [...prev, fontName]);
      
      // Add to font metadata
      const newFont: FontWithPermissions = {
        name: fontName,
        file_path: filePath,
        file_type: fileExtension || 'ttf',
        user_id: user.id,
        is_public: false
      };
      
      setFontsWithMetadata(prev => [...prev, newFont]);

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

  // Placeholder for toggleFontPublic function - will be implemented after DB update
  const toggleFontPublic = async (fontName: string, isPublic: boolean) => {
    if (!user) return false;
    
    try {
      // For now, just update the local state since the database doesn't have the column yet
      setFontsWithMetadata(prev => 
        prev.map(font => 
          font.name === fontName && font.user_id === user.id 
            ? { ...font, is_public: isPublic } 
            : font
        )
      );
      
      toast.success(`Font "${fontName}" đã được đặt thành ${isPublic ? "công khai" : "riêng tư"}`);
      toast.info("Chức năng này sẽ được kích hoạt đầy đủ sau khi cơ sở dữ liệu được cập nhật.");
      return true;
    } catch (error) {
      console.error('Error toggling font visibility:', error);
      toast.error('Không thể cập nhật trạng thái của font');
      return false;
    }
  };
  
  // Function to check if user can access a specific font
  const canUserAccessFont = (fontName: string): boolean => {
    if (isAdmin) return true;
    
    const fontData = fontsWithMetadata.find(f => f.name === fontName);
    if (!fontData) return true; // If we don't have metadata, allow access
    
    return fontData.is_public || (user && fontData.user_id === user.id);
  };
  
  return {
    customFonts,
    fontsWithMetadata,
    isUploading,
    uploadFont,
    loadSavedFonts,
    toggleFontPublic,
    canUserAccessFont
  };
};
