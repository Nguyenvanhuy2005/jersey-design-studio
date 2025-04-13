
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PrintGlobalSettingsProps {
  fontTextOptions: string[];
  fontText: string;
  onFontTextChange: (value: string) => void;
  fontNumberOptions: string[];
  fontNumber: string;
  onFontNumberChange: (value: string) => void;
  printStyleOptions: string[];
  printStyle: string;
  onPrintStyleChange: (value: string) => void;
  printColorOptions: string[];
  printColor: string;
  onPrintColorChange: (value: string) => void;
}

export function PrintGlobalSettings({
  fontTextOptions,
  fontText,
  onFontTextChange,
  fontNumberOptions,
  fontNumber,
  onFontNumberChange,
  printStyleOptions,
  printStyle,
  onPrintStyleChange,
  printColorOptions,
  printColor,
  onPrintColorChange
}: PrintGlobalSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cấu hình in ấn chung</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="fontText">Font chữ</Label>
            <Select value={fontText} onValueChange={onFontTextChange}>
              <SelectTrigger id="fontText">
                <SelectValue placeholder="Chọn font chữ" />
              </SelectTrigger>
              <SelectContent>
                {fontTextOptions.map(font => (
                  <SelectItem key={font} value={font}>{font}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="fontNumber">Font số</Label>
            <Select value={fontNumber} onValueChange={onFontNumberChange}>
              <SelectTrigger id="fontNumber">
                <SelectValue placeholder="Chọn font số" />
              </SelectTrigger>
              <SelectContent>
                {fontNumberOptions.map(font => (
                  <SelectItem key={font} value={font}>{font}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="printStyle">Kiểu in</Label>
            <Select value={printStyle} onValueChange={onPrintStyleChange}>
              <SelectTrigger id="printStyle">
                <SelectValue placeholder="Chọn kiểu in" />
              </SelectTrigger>
              <SelectContent>
                {printStyleOptions.map(style => (
                  <SelectItem key={style} value={style}>{style}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="printColor">Màu in</Label>
            <Select value={printColor} onValueChange={onPrintColorChange}>
              <SelectTrigger id="printColor">
                <SelectValue placeholder="Chọn màu in" />
              </SelectTrigger>
              <SelectContent>
                {printColorOptions.map(color => (
                  <SelectItem key={color} value={color}>{color}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
