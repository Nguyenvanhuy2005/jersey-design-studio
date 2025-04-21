
import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo, ProductLine } from "@/types";
import { Plus, X } from "lucide-react";

interface ProductLineTableProps {
  productLines: ProductLine[];
  onProductLinesChange: (productLines: ProductLine[]) => void;
  logos?: Logo[];
}

export function ProductLineTable({ productLines, onProductLinesChange, logos = [] }: ProductLineTableProps) {
  const lastUsedMaterial = productLines.length
    ? productLines[productLines.length - 1].material
    : "In chuyển nhiệt";

  const [newProductLine, setNewProductLine] = useState<Omit<ProductLine, 'id'>>({
    product: "",
    position: "",
    material: lastUsedMaterial,
    size: "",
    points: 0,
    content: ""
  });

  React.useEffect(() => {
    if (productLines.length === 0 && newProductLine.material !== "In chuyển nhiệt") {
      setNewProductLine((prev) => ({ ...prev, material: "In chuyển nhiệt" }));
    }
  }, [productLines.length]);

  const addProductLine = () => {
    if (!newProductLine.product || !newProductLine.position || !newProductLine.material) return;

    const updatedProductLines = [
      ...productLines, 
      { ...newProductLine, id: `product-${Date.now()}` }
    ];

    onProductLinesChange(updatedProductLines);

    setNewProductLine({
      product: "",
      position: "",
      material: newProductLine.material,
      size: "",
      points: 0,
      content: ""
    });
  };

  const removeProductLine = (index: number) => {
    const updatedProductLines = [...productLines];
    updatedProductLines.splice(index, 1);
    onProductLinesChange(updatedProductLines);
  };

  const updateProductLine = (index: number, field: string, value: string | number) => {
    const updatedProductLines = [...productLines];
    updatedProductLines[index] = { 
      ...updatedProductLines[index], 
      [field]: value 
    };
    onProductLinesChange(updatedProductLines);
  };

  const isLogoPosition = (position: string) => {
    return position.toLowerCase().includes('logo');
  };

  const printPositions = [
    { value: "In số quần", label: "In số quần" },
    { value: "In số lưng", label: "In số lưng" },
    { value: "In trên số lưng", label: "In trên số lưng" },
    { value: "In dưới số lưng", label: "In dưới số lưng" },
    { value: "In logo tay trái", label: "In logo tay trái" },
    { value: "In logo tay phải", label: "In logo tay phải" },
    { value: "In logo ngực trái", label: "In logo ngực trái" },
    { value: "In logo ngực phải", label: "In logo ngực phải" },
    { value: "In logo giữa bụng", label: "In logo giữa bụng" },
    { value: "In số tay trái", label: "In số tay trái" },
    { value: "In số tay phải", label: "In số tay phải" },
    { value: "In số giữa bụng", label: "In số giữa bụng" }
  ];

  const materialOptions = [
    { value: "In chuyển nhiệt", label: "In chuyển nhiệt" },
    { value: "In decal", label: "In decal" }
  ];
  
  const getContentOptions = (position: string) => {
    if (isLogoPosition(position)) {
      return logos.map(logo => {
        const fileName = logo.file.name.split('/').pop()?.split('.')[0] || `Logo ${logo.id}`;
        return {
          value: fileName,
          label: fileName
        };
      });
    }
    
    if (position.includes('số')) {
      return [{ value: "Số áo", label: "Số áo" }];
    } else if (position.includes('tên') || position.includes('trên số lưng')) {
      return [{ value: "Tên cầu thủ", label: "Tên cầu thủ" }];
    }
    
    return [];
  };

  const isNewPositionLogoRelated = isLogoPosition(newProductLine.position);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Sản phẩm in</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 text-left">Sản phẩm</th>
              <th className="p-2 text-left">Vị trí in</th>
              <th className="p-2 text-left">Chất liệu</th>
              <th className="p-2 text-left">Kích thước</th>
              <th className="p-2 text-left">Điểm tích</th>
              <th className="p-2 text-left">Nội dung</th>
              <th className="p-2 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {productLines.map((productLine, index) => {
              const isLogoRelated = isLogoPosition(productLine.position);
              const contentOptions = getContentOptions(productLine.position);
              
              return (
                <tr key={productLine.id} className="border-b border-muted">
                  <td className="p-2">{productLine.product}</td>
                  <td className="p-2">{productLine.position}</td>
                  <td className="p-2">{productLine.material}</td>
                  <td className="p-2">{productLine.size}</td>
                  <td className="p-2">{productLine.points}</td>
                  <td className="p-2">
                    {isLogoRelated && contentOptions.length > 0 ? (
                      <Select
                        value={productLine.content}
                        onValueChange={(value) => updateProductLine(index, 'content', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn logo" />
                        </SelectTrigger>
                        <SelectContent>
                          {contentOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      productLine.content
                    )}
                  </td>
                  <td className="p-2">
                    <Button variant="ghost" size="icon" onClick={() => removeProductLine(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-end">
        <Select
          value={newProductLine.product}
          onValueChange={(value) => setNewProductLine(prev => ({ ...prev, product: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sản phẩm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Áo thi đấu">Áo thi đấu</SelectItem>
            <SelectItem value="Quần thi đấu">Quần thi đấu</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={newProductLine.position}
          onValueChange={(value) => setNewProductLine(prev => ({ ...prev, position: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Vị trí in" />
          </SelectTrigger>
          <SelectContent>
            {printPositions.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={newProductLine.material}
          onValueChange={(value) => setNewProductLine(prev => ({ ...prev, material: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chất liệu" />
          </SelectTrigger>
          <SelectContent>
            {materialOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={newProductLine.size}
          onValueChange={(value) => setNewProductLine(prev => ({ ...prev, size: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Kích thước" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Nhỏ">Nhỏ</SelectItem>
            <SelectItem value="Trung bình">Trung bình</SelectItem>
            <SelectItem value="Lớn">Lớn</SelectItem>
          </SelectContent>
        </Select>
        
        <Input 
          type="number"
          value={newProductLine.points || ""}
          onChange={(e) => setNewProductLine(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
          placeholder="Điểm tích"
        />
        
        {isNewPositionLogoRelated && logos.length > 0 ? (
          <Select
            value={newProductLine.content}
            onValueChange={(value) => setNewProductLine(prev => ({ ...prev, content: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn logo" />
            </SelectTrigger>
            <SelectContent>
              {getContentOptions(newProductLine.position).map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input 
            value={newProductLine.content}
            onChange={(e) => setNewProductLine(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Nội dung in"
          />
        )}
        
        <Button onClick={addProductLine} className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> Thêm
        </Button>
      </div>
    </div>
  );
}
