
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
  designData?: any;
}

export const PrintConfig = ({ printConfig, designData }: PrintConfigProps) => {
  const { user } = useAuth();
  const [fontOwnerName, setFontOwnerName] = useState<string>("");
  const [canDownload, setCanDownload] = useState<boolean>(false);
  const [fontName, setFontName] = useState<string>("Arial");
  
  useEffect(() => {
    // First check designData for font information
    if (designData && designData.font_text && designData.font_text.font) {
      setFontName(designData.font_text.font);
      setCanDownload(true);
      return;
    }
    
    // Fall back to printConfig
    if (printConfig?.font) {
      setFontName(printConfig.font);
      setCanDownload(true);
    }
  }, [printConfig?.font, designData, user]);
  
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
      const { data: fontData, error: dbError } = await supabase
        .from('fonts')
        .select('file_path, file_type')
        .eq('name', fontName)
        .maybeSingle();

      if (dbError) throw new Error(dbError.message);
      if (!fontData) throw new Error('Font not found');

      const { data, error: storageError } = await supabase.storage
        .from('fonts')
        .download(fontData.file_path);

      if (storageError) throw new Error(storageError.message);

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
                    <span style={{ fontFamily: fontName }}>{fontName}</span>
                    {canDownload && fontName && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(fontName)}
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
