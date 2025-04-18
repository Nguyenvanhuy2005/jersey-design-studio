
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useFonts } from "@/hooks/useFonts";
import { useState } from "react";

interface PrintGlobalSettingsProps {
  fontTextOptions: string[];
  fontText: string;
  onFontTextChange: (value: string) => void;
  fontNumberOptions: string[];
  fontNumber: string;
  onFontNumberChange: (value: string) => void;
}

export function PrintGlobalSettings({
  fontTextOptions,
  fontText,
  onFontTextChange,
  fontNumberOptions,
  fontNumber,
  onFontNumberChange,
}: PrintGlobalSettingsProps) {
  const { customFonts, uploadFont, isUploading } = useFonts();
  const [uploadType, setUploadType] = useState<'text' | 'number'>('text');
  
  const allTextFonts = [...new Set([...fontTextOptions, ...customFonts])];
  const allNumberFonts = [...new Set([...fontNumberOptions, ...customFonts])];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { success, fontName } = await uploadFont(file);
    if (success) {
      if (uploadType === 'text') {
        onFontTextChange(fontName);
      } else {
        onFontNumberChange(fontName);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cấu hình in ấn chung</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label htmlFor="fontText">Font chữ</Label>
            <Select value={fontText} onValueChange={onFontTextChange}>
              <SelectTrigger id="fontText">
                <SelectValue placeholder="Chọn font chữ" />
              </SelectTrigger>
              <SelectContent>
                {allTextFonts.map(font => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <Input
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                onChange={handleFileChange}
                className="hidden"
                id="fontTextUpload"
                disabled={isUploading}
                onClick={() => setUploadType('text')}
              />
              <Label htmlFor="fontTextUpload" className="cursor-pointer">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Tải lên font chữ mới
                </Button>
              </Label>
            </div>
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="fontNumber">Font số</Label>
            <Select value={fontNumber} onValueChange={onFontNumberChange}>
              <SelectTrigger id="fontNumber">
                <SelectValue placeholder="Chọn font số" />
              </SelectTrigger>
              <SelectContent>
                {allNumberFonts.map(font => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <Input
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                onChange={handleFileChange}
                className="hidden"
                id="fontNumberUpload"
                disabled={isUploading}
                onClick={() => setUploadType('number')}
              />
              <Label htmlFor="fontNumberUpload" className="cursor-pointer">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Tải lên font số mới
                </Button>
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
