
import { Order } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Printer, Type } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrintConfigProps {
  printConfig: Order['printConfig'];
}

export const PrintConfig = ({ printConfig }: PrintConfigProps) => {
  if (!printConfig) return null;

  const handleDownload = (font: string) => {
    const link = document.createElement('a');
    link.href = `/fonts/${font}.ttf`;
    link.download = `${font}.ttf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const printFields = [
    {
      section: "Font chữ",
      icon: <Type className="h-4 w-4" />,
      fields: [
        { label: "Font chữ/số", value: printConfig.font }
      ]
    },
    {
      section: "Mặt lưng",
      icon: <Printer className="h-4 w-4" />,
      fields: [
        { label: "Chất liệu", value: printConfig.backMaterial }
      ]
    },
    {
      section: "Mặt trước",
      icon: <Printer className="h-4 w-4" />,
      fields: [
        { label: "Chất liệu", value: printConfig.frontMaterial }
      ]
    },
    {
      section: "Tay áo",
      icon: <Printer className="h-4 w-4" />,
      fields: [
        { label: "Chất liệu", value: printConfig.sleeveMaterial }
      ]
    },
    {
      section: "Quần",
      icon: <Printer className="h-4 w-4" />,
      fields: [
        { label: "Chất liệu", value: printConfig.legMaterial }
      ]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="h-5 w-5" />
          Cấu hình in
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {printFields.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              {section.icon}
              {section.section}
            </h4>
            <Table>
              <TableBody>
                {section.fields.map((field, fieldIdx) => (
                  <TableRow key={fieldIdx}>
                    <TableCell className="w-1/3 font-medium text-muted-foreground">
                      {field.label}
                    </TableCell>
                    <TableCell className="flex items-center justify-between">
                      <span>{field.value}</span>
                      {section.section === "Font chữ" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(field.value)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Tải xuống font
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
