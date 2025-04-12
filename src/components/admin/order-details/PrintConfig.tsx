
import { Order } from "@/types";

interface PrintConfigProps {
  printConfig: Order['printConfig'];
}

export const PrintConfig = ({ printConfig }: PrintConfigProps) => {
  if (!printConfig) return null;
  
  // Group the print config fields for better organization
  const fieldsGroups = [
    { label: "Font", value: printConfig.font },
    { label: "Chất liệu in lưng", value: printConfig.backMaterial },
    { label: "Màu in lưng", value: printConfig.backColor },
    { label: "Chất liệu in mặt trước", value: printConfig.frontMaterial },
    { label: "Màu in mặt trước", value: printConfig.frontColor },
    { label: "Chất liệu in tay áo", value: printConfig.sleeveMaterial },
    { label: "Màu in tay áo", value: printConfig.sleeveColor },
    { label: "Chất liệu in quần", value: printConfig.legMaterial },
    { label: "Màu in quần", value: printConfig.legColor }
  ];
  
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Cấu hình in</h3>
      <div className="grid gap-1">
        {fieldsGroups.map((field, index) => (
          field.value && (
            <p key={index} className="text-sm">
              <span className="text-muted-foreground">{field.label}:</span> {field.value}
            </p>
          )
        ))}
      </div>
    </div>
  );
};
