
import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Type } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface PrintConfigProps {
  printConfig: Order['printConfig'];
}

export const PrintConfig = ({ printConfig }: PrintConfigProps) => {
  const { user } = useAuth();
  const [fontOwnerName, setFontOwnerName] = useState<string>("");
  const [canDownload, setCanDownload] = useState<boolean>(false);
  
  useEffect(() => {
    if (!printConfig?.font) return;
    
    const checkFontPermission = async () => {
      try {
        // Get font details
        const { data: fontData, error: fontError } = await supabase
          .from('fonts')
          .select('user_id, is_public')
          .eq('name', printConfig.font)
          .maybeSingle();

        if (fontError) throw new Error(fontError.message);
        
        // If font is not found, allow download (system font)
        if (!fontData) {
          setCanDownload(true);
          return;
        }
        
        // Check if user can download this font (is owner, font is public, or user is admin)
        const canUserDownload = fontData.is_public || 
          (user && (user.id === fontData.user_id || await checkIsAdmin()));
        
        setCanDownload(canUserDownload);
        
        // Get font owner's name if applicable
        if (fontData.user_id) {
          const { data: userData } = await supabase
            .from('customers')
            .select('name')
            .eq('id', fontData.user_id)
            .maybeSingle();
          
          if (userData?.name) {
            setFontOwnerName(`Font được tải lên bởi: ${userData.name}`);
          }
        }
      } catch (error) {
        console.error('Error checking font permission:', error);
      }
    };
    
    checkFontPermission();
  }, [printConfig?.font, user]);
  
  const checkIsAdmin = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      return !error && !!data;
    } catch {
      return false;
    }
  };

  const handleDownload = async (fontName: string) => {
    try {
      // Get font file path from database
      const { data: fontData, error: dbError } = await supabase
        .from('fonts')
        .select('file_path, file_type')
        .eq('name', fontName)
        .maybeSingle();

      if (dbError) throw new Error(dbError.message);
      if (!fontData) throw new Error('Font not found');

      // Get download URL from storage
      const { data, error: storageError } = await supabase.storage
        .from('fonts')
        .download(fontData.file_path);

      if (storageError) throw new Error(storageError.message);

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fontName}.${fontData.file_type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading font:', error);
      toast.error('Không thể tải xuống font chữ');
    }
  };
  
  if (!printConfig) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          Cấu hình in
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Type className="h-4 w-4" />
            Font chữ
          </h4>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="w-1/3 font-medium text-muted-foreground">
                  Font chữ/số
                </TableCell>
                <TableCell className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span style={{ fontFamily: printConfig.font }}>{printConfig.font}</span>
                    {canDownload && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(printConfig.font)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Tải xuống font
                      </Button>
                    )}
                  </div>
                  {fontOwnerName && (
                    <p className="text-xs text-muted-foreground">{fontOwnerName}</p>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
