
import { Order } from "@/types";

interface PrintConfigProps {
  printConfig: Order['printConfig'];
  designData?: Order['designData'];
}

export const PrintConfig = ({ printConfig, designData }: PrintConfigProps) => {
  if (!printConfig) return null;
  
  // Group the print config fields for better organization
  const fieldsGroups = [
    { label: "Font chữ", value: designData?.font_text?.font || printConfig.fontText?.font || 'Arial' },
    { label: "Font số", value: designData?.font_number?.font || printConfig.fontNumber?.font || 'Arial' },
    { label: "Chất liệu in lưng", value: printConfig.backMaterial },
    { label: "Màu in lưng", value: printConfig.backColor },
    { label: "Chất liệu in mặt trước", value: printConfig.frontMaterial },
    { label: "Màu in mặt trước", value: printConfig.frontColor },
    { label: "Chất liệu in tay áo", value: printConfig.sleeveMaterial },
    { label: "Màu in tay áo", value: printConfig.sleeveColor },
    { label: "Chất liệu in quần", value: printConfig.legMaterial },
    { label: "Màu in quần", value: printConfig.legColor }
  ];
  
  // Custom print positions from design data
  const printPositions = [];
  
  if (designData?.line_1?.enabled) {
    printPositions.push({
      label: "IN DÒNG 1 (trên số lưng)",
      content: designData.line_1.content,
      material: designData.line_1.material,
      color: designData.line_1.color
    });
  }
  
  if (designData?.line_2?.enabled) {
    printPositions.push({
      label: "IN DÒNG 2 (số lưng)",
      material: designData.line_2.material,
      color: designData.line_2.color
    });
  }
  
  if (designData?.line_3?.enabled) {
    printPositions.push({
      label: "IN DÒNG 3 (dưới số lưng)",
      content: designData.line_3.content,
      material: designData.line_3.material,
      color: designData.line_3.color
    });
  }
  
  if (designData?.chest_text?.enabled) {
    printPositions.push({
      label: "IN CHỮ NGỰC",
      content: designData.chest_text.content,
      material: designData.chest_text.material,
      color: designData.chest_text.color
    });
  }
  
  if (designData?.chest_number?.enabled) {
    printPositions.push({
      label: "IN SỐ NGỰC",
      material: designData.chest_number.material,
      color: designData.chest_number.color
    });
  }
  
  if (designData?.pants_number?.enabled) {
    printPositions.push({
      label: "IN SỐ QUẦN",
      material: designData.pants_number.material,
      color: designData.pants_number.color
    });
  }
  
  if (designData?.pet_chest?.enabled) {
    printPositions.push({
      label: "IN PET NGỰC",
      content: designData.pet_chest.content,
      material: designData.pet_chest.material,
      color: designData.pet_chest.color
    });
  }
  
  return (
    <div className="space-y-4">
      <div>
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
      
      {printPositions.length > 0 && (
        <div>
          <h3 className="font-semibold">Vị trí in tùy chỉnh</h3>
          <div className="space-y-2">
            {printPositions.map((pos, index) => (
              <div key={index} className="text-sm border-b pb-1">
                <p className="font-medium">{pos.label}</p>
                {pos.content && (
                  <p className="text-xs">
                    <span className="text-muted-foreground">Nội dung:</span> {pos.content}
                  </p>
                )}
                {pos.material && (
                  <p className="text-xs">
                    <span className="text-muted-foreground">Chất liệu:</span> {pos.material}
                  </p>
                )}
                {pos.color && (
                  <p className="text-xs">
                    <span className="text-muted-foreground">Màu sắc:</span> {pos.color}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
