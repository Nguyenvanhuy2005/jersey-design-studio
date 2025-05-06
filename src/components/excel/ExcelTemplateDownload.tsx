
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

interface ExcelTemplateDownloadProps {
  printStyleOptions?: string[];
}

export const ExcelTemplateDownload = ({ printStyleOptions = ["In chuyển nhiệt"] }: ExcelTemplateDownloadProps) => {
  const downloadExcelTemplate = () => {
    try {
      const template = [{
        "STT": 1,
        "TÊN IN TRÊN SỐ": "Tên trên số",
        "SỐ ÁO": "01",
        "TÊN ĐỘI BÓNG": "Tên đội",
        "IN CHỮ NGỰC": "Tên chữ ngực",
        "KÍCH THƯỚC": "M",
        "KIỂU IN": printStyleOptions[0] || "In chuyển nhiệt",
        "LOẠI QUẦN ÁO": "Cầu thủ",
        "IN SỐ NGỰC": "Không",
        "IN SỐ QUẦN": "Không",
        "LOGO NGỰC TRÁI": "Không",
        "LOGO NGỰC PHẢI": "Không",
        "LOGO NGỰC GIỮA": "Không",
        "LOGO TAY TRÁI": "Không",
        "LOGO TAY PHẢI": "Không",
        "LOGO QUẦN": "Không",
        "GHI CHÚ": ""
      }];
      
      const ws = XLSX.utils.json_to_sheet(template);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, "danh_sach_cau_thu_template.xlsx");
      
      toast.success("Đã tải xuống mẫu Excel thành công");
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Có lỗi khi tải xuống mẫu Excel");
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={downloadExcelTemplate} 
      className="flex items-center gap-1"
      title="Tải xuống mẫu Excel"
    >
      <Download className="h-4 w-4" />
    </Button>
  );
};
