
import { Order } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, Type } from "lucide-react";

interface PrintConfigProps {
  printConfig: Order['printConfig'];
}

export const PrintConfig = ({ printConfig }: PrintConfigProps) => {
  if (!printConfig) return null;
  
  // Group the print config fields for better organization
  const printFields = [
    {
      section: "Font",
      icon: <Type className="h-4 w-4" />,
      fields: [
        { label: "Font chữ/số", value: printConfig.font }
      ]
    },
    {
      section: "Mặt lưng",
      icon: <Printer className="h-4 w-4" />,
      fields: [
        { label: "Chất liệu", value: printConfig.backMaterial },
        { label: "Màu sắc", value: printConfig.backColor }
      ]
    },
    {
      section: "Mặt trước",
      icon: <Printer className="h-4 w-4" />,
      fields: [
        { label: "Chất liệu", value: printConfig.frontMaterial },
        { label: "Màu sắc", value: printConfig.frontColor }
      ]
    },
    {
      section: "Tay áo",
      icon: <Printer className="h-4 w-4" />,
      fields: [
        { label: "Chất liệu", value: printConfig.sleeveMaterial },
        { label: "Màu sắc", value: printConfig.sleeveColor }
      ]
    },
    {
      section: "Quần",
      icon: <Printer className="h-4 w-4" />,
      fields: [
        { label: "Chất liệu", value: printConfig.legMaterial },
        { label: "Màu sắc", value: printConfig.legColor }
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
                    <TableCell>{field.value}</TableCell>
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
