
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { DesignData, PrintConfig } from "@/types";

interface ExcelHandlerResult {
  newDesignData: DesignData;
  updatedPrintConfig?: PrintConfig;
}

export const useExcelHandler = (currentDesignData: DesignData, currentPrintConfig: PrintConfig) => {
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const result = processExcelFile(evt.target?.result, currentDesignData, currentPrintConfig);
        return result;
      } catch (error) {
        console.error("Excel import error:", error);
        toast.error("Lỗi khi xử lý file Excel. Vui lòng kiểm tra định dạng file.");
        return null;
      }
    };
    
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  return { handleExcelUpload };
};

export const processExcelFile = (
  binaryStr: string | ArrayBuffer | null, 
  currentDesignData: DesignData, 
  currentPrintConfig: PrintConfig
): ExcelHandlerResult | null => {
  if (!binaryStr) return null;

  const workbook = XLSX.read(binaryStr, { type: 'binary' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const data = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

  const headerRow = data.find(row => 
    Array.isArray(row) && row.some(cell => 
      typeof cell === 'string' && 
      (cell.includes('DÒNG 1') || cell.includes('DÒNG 2') || cell.includes('KÍCH THƯỚC'))
    )
  );

  if (!headerRow) {
    toast.error("Không tìm thấy dòng tiêu đề trong file Excel. Vui lòng kiểm tra định dạng file.");
    return null;
  }

  const line1Idx = headerRow.findIndex((col: any) => 
    typeof col === 'string' && (col.includes('DÒNG 1') || col.includes('TRÊN SỐ LƯNG'))
  );
  const line2Idx = headerRow.findIndex((col: any) => 
    typeof col === 'string' && (col.includes('DÒNG 2') || col.includes('SỐ LƯNG'))
  );
  const line3Idx = headerRow.findIndex((col: any) => 
    typeof col === 'string' && (col.includes('DÒNG 3') || col.includes('DƯỚI SỐ LƯNG'))
  );
  const sizeIdx = headerRow.findIndex((col: any) => 
    typeof col === 'string' && (col.includes('KÍCH THƯỚC') || col.includes('SIZE'))
  );
  const chestTextIdx = headerRow.findIndex((col: any) => 
    typeof col === 'string' && col.includes('CHỮ NGỰC')
  );
  const chestNumberIdx = headerRow.findIndex((col: any) => 
    typeof col === 'string' && col.includes('SỐ NGỰC')
  );
  const pantsNumberIdx = headerRow.findIndex((col: any) => 
    typeof col === 'string' && col.includes('SỐ QUẦN')
  );
  const fontTextIdx = headerRow.findIndex((col: any) => 
    typeof col === 'string' && col.includes('FONT CHỮ')
  );
  const fontNumberIdx = headerRow.findIndex((col: any) => 
    typeof col === 'string' && col.includes('FONT SỐ')
  );

  const newDesignData: DesignData = {
    ...currentDesignData
  };

  let updatedPrintConfig: PrintConfig | undefined;

  const dataRow = data[headerRow.length > 0 ? headerRow.length : 0];
  if (dataRow) {
    if (fontTextIdx !== -1 && dataRow[fontTextIdx]) {
      newDesignData.font_text = {
        font: String(dataRow[fontTextIdx])
      };
    }
    
    if (fontNumberIdx !== -1 && dataRow[fontNumberIdx]) {
      newDesignData.font_number = {
        font: String(dataRow[fontNumberIdx])
      };
    }

    if (line1Idx !== -1 && dataRow[line1Idx]) {
      newDesignData.line_1 = {
        content: String(dataRow[line1Idx]),
        material: "In chuyển nhiệt",
        color: "Đen",
        enabled: true
      };
    }
    
    if (line3Idx !== -1 && dataRow[line3Idx]) {
      newDesignData.line_3 = {
        content: String(dataRow[line3Idx]),
        material: "In chuyển nhiệt",
        color: "Đen",
        enabled: true
      };
    }
    
    if (chestTextIdx !== -1 && dataRow[chestTextIdx]) {
      newDesignData.chest_text = {
        content: String(dataRow[chestTextIdx]),
        material: "In chuyển nhiệt",
        color: "Đen",
        enabled: true
      };
    }

    if (line2Idx !== -1 && (dataRow[line2Idx] === "1" || dataRow[line2Idx] === "true" || dataRow[line2Idx] === "có")) {
      newDesignData.line_2 = {
        material: "In chuyển nhiệt",
        color: "Đen",
        enabled: true
      };
    }
    
    if (chestNumberIdx !== -1 && (dataRow[chestNumberIdx] === "1" || dataRow[chestNumberIdx] === "true" || dataRow[chestNumberIdx] === "có")) {
      newDesignData.chest_number = {
        material: "In chuyển nhiệt",
        color: "Đen",
        enabled: true
      };
    }
    
    if (pantsNumberIdx !== -1 && (dataRow[pantsNumberIdx] === "1" || dataRow[pantsNumberIdx] === "true" || dataRow[pantsNumberIdx] === "có")) {
      newDesignData.pants_number = {
        material: "In chuyển nhiệt",
        color: "Đen",
        enabled: true
      };
    }
  }

  if (newDesignData.font_text?.font || newDesignData.font_number?.font) {
    updatedPrintConfig = { ...currentPrintConfig };
    
    if (newDesignData.font_text?.font) {
      updatedPrintConfig.fontText = {
        font: newDesignData.font_text.font
      };
    }
    
    if (newDesignData.font_number?.font) {
      updatedPrintConfig.fontNumber = {
        font: newDesignData.font_number.font
      };
    }
  }

  toast.success("Đã tải thông tin in từ file Excel");

  return {
    newDesignData,
    updatedPrintConfig
  };
};
