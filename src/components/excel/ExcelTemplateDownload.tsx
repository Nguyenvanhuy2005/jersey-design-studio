
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';

export const ExcelTemplateDownload = () => {
  const downloadExcelTemplate = () => {
    const template = [{
      "STT": 1,
      "SỐ ÁO": "01",
      "TÊN IN TRÊN SỐ": "Tên trên số",
      "TÊN ĐỘI BÓNG": "Tên đội",
      "KÍCH THƯỚC": "M",
      "KIỂU IN": "In chuyển nhiệt",
      "LOẠI QUẦN ÁO": "Cầu thủ",
      "IN CHỮ NGỰC": "",
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
  };

  return (
    <Button variant="outline" size="icon" onClick={downloadExcelTemplate}>
      <Download className="h-4 w-4" />
    </Button>
  );
};
