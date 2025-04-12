
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductLine } from "@/types";
import { Plus, X } from "lucide-react";

interface ProductLineTableProps {
  productLines: ProductLine[];
  onProductLinesChange: (productLines: ProductLine[]) => void;
}

export function ProductLineTable({ productLines, onProductLinesChange }: ProductLineTableProps) {
  const [newProductLine, setNewProductLine] = useState<Omit<ProductLine, 'id'>>({
    product: "",
    position: "",
    material: "",
    size: "",
    points: 0,
    content: ""
  });

  const addProductLine = () => {
    if (!newProductLine.product || !newProductLine.position) return;
    
    const updatedProductLines = [
      ...productLines, 
      { ...newProductLine, id: `product-${Date.now()}` }
    ];
    
    onProductLinesChange(updatedProductLines);
    
    setNewProductLine({
      product: "",
      position: "",
      material: "",
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Sản phẩm in</h2>
      
      {/* Product lines table */}
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
            {productLines.map((productLine, index) => (
              <tr key={productLine.id} className="border-b border-muted">
                <td className="p-2">{productLine.product}</td>
                <td className="p-2">{productLine.position}</td>
                <td className="p-2">{productLine.material}</td>
                <td className="p-2">{productLine.size}</td>
                <td className="p-2">{productLine.points}</td>
                <td className="p-2">{productLine.content}</td>
                <td className="p-2">
                  <Button variant="ghost" size="icon" onClick={() => removeProductLine(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Add product line form */}
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
            <SelectItem value="Lưng trên">Lưng trên</SelectItem>
            <SelectItem value="Lưng giữa">Lưng giữa</SelectItem>
            <SelectItem value="Lưng dưới">Lưng dưới</SelectItem>
            <SelectItem value="Tay">Tay</SelectItem>
            <SelectItem value="Ống quần">Ống quần</SelectItem>
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
            <SelectItem value="In chuyển nhiệt">In chuyển nhiệt</SelectItem>
            <SelectItem value="In trực tiếp">In trực tiếp</SelectItem>
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
        
        <Input 
          value={newProductLine.content}
          onChange={(e) => setNewProductLine(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Nội dung in"
        />
        
        <Button onClick={addProductLine} className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> Thêm
        </Button>
      </div>
    </div>
  );
}
