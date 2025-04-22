
import React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo, ProductLine } from "@/types";
import { Plus, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProductLineTableProps {
  productLines: ProductLine[];
  onProductLinesChange: (productLines: ProductLine[]) => void;
  logos?: Logo[];
}

export function ProductLineTable({ productLines, onProductLinesChange, logos = [] }: ProductLineTableProps) {
  // Find last used material from existing product lines
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

  // Track validation errors
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset validation error when form values change
  useEffect(() => {
    setValidationError(null);
  }, [newProductLine]);

  useEffect(() => {
    if (productLines.length === 0 && newProductLine.material !== "In chuyển nhiệt") {
      setNewProductLine((prev) => ({ ...prev, material: "In chuyển nhiệt" }));
    }
  }, [productLines.length]);

  const addProductLine = () => {
    // Validate form before adding
    if (!newProductLine.product) {
      setValidationError("Vui lòng chọn sản phẩm");
      return;
    }
    
    if (!newProductLine.position) {
      setValidationError("Vui lòng chọn vị trí in");
      return;
    }
    
    if (!newProductLine.material) {
      setValidationError("Vui lòng chọn chất liệu");
      return;
    }

    // If this is a logo position, make sure we have content selected when logos are available
    const isLogoPosition = newProductLine.position.toLowerCase().includes('logo');
    if (isLogoPosition && logos.length > 0 && !newProductLine.content) {
      setValidationError("Vui lòng chọn logo cho vị trí in này");
      return;
    }

    const updatedProductLines = [
      ...productLines, 
      { 
        ...newProductLine, 
        id: `product-${Date.now()}`,
        // Ensure all required fields have valid values
        product: newProductLine.product || "Áo thi đấu",
        position: newProductLine.position,
        material: newProductLine.material || "In chuyển nhiệt",
        size: newProductLine.size || "Trung bình",
        points: newProductLine.points || 0,
        content: newProductLine.content || ""
      }
    ];

    onProductLinesChange(updatedProductLines);
    setValidationError(null);

    setNewProductLine({
      product: "",
      position: "",
      material: newProductLine.material, // Keep the same material for next product
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
      // Make sure we have valid logos with either file.name or url/previewUrl
      return logos.filter(logo => {
        return logo && (logo.file || logo.url || logo.previewUrl);
      }).map(logo => {
        let fileName;
        
        // Handle differently based on whether we have a file object or just a URL
        if (logo.file && logo.file.name) {
          fileName = logo.file.name.split('/').pop()?.split('.')[0] || `Logo ${logo.id}`;
        } else {
          // If we only have URL, create a label based on position
          const positionName = logo.position === 'chest_left' ? 'Ngực trái' :
                              logo.position === 'chest_right' ? 'Ngực phải' :
                              logo.position === 'chest_center' ? 'Ngực giữa' :
                              logo.position === 'sleeve_left' ? 'Tay trái' :
                              logo.position === 'sleeve_right' ? 'Tay phải' :
                              logo.position === 'pants' ? 'Quần' : 'Logo';
          fileName = `Logo ${positionName}`;
        }
        
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

  // Check if we have valid logos for content selection
  const validLogos = logos.filter(logo => logo && (logo.file || logo.url || logo.previewUrl));
  const hasValidLogos = validLogos.length > 0;

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
                  <td className="p-2">
                    <Select
                      value={productLine.material}
                      onValueChange={(value) => updateProductLine(index, 'material', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn chất liệu" />
                      </SelectTrigger>
                      <SelectContent>
                        {materialOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
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
      
      {validationError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}
      
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
        
        {isNewPositionLogoRelated && hasValidLogos ? (
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
