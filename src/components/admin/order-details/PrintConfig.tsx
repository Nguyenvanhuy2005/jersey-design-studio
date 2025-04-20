
import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Type } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PrintConfigProps {
  printConfig: Order['printConfig'];
}

export const PrintConfig = ({ printConfig }: PrintConfigProps) => {
  if (!printConfig) return null;

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
                <TableCell className="flex items-center justify-between">
                  <span style={{ fontFamily: printConfig.font }}>{printConfig.font}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(printConfig.font)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Tải xuống font
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
