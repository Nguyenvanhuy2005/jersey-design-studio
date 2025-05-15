import { useState, useCallback } from 'react';
import { Player } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { useOrderContext } from '@/contexts/OrderContext';

interface UsePlayerFormProps {
  printStyle: string;
}

export const usePlayerForm = ({ printStyle }: UsePlayerFormProps) => {
  const { onPlayersChange } = useOrderContext();

  const getUniformTypeFromExcel = (row: any): string => {
    const position = row['Vị trí'] || row['Position'] || '';
    if (typeof position === 'string' && position.toLowerCase().includes('thủ môn')) {
      return 'goalkeeper';
    }
    return 'player';
  };

  // Function to handle Excel import
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Reset the input value to allow the same file to be selected again
    e.target.value = '';
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          toast.error('Không tìm thấy dữ liệu trong file Excel.');
          return;
        }
        
        // Create players array from Excel data
        const newPlayers = jsonData.map((row: any) => {
          // Extract number - preserve it as is without any zero-padding
          const playerNumber = row['Số áo'] || row['Number'] || row['Số'] || '';
          
          // Create a player object
          const player: Player = {
            id: uuidv4(),
            name: row['Tên'] || row['Name'] || '',
            number: String(playerNumber), // Convert to string but don't pad
            size: row['Kích thước'] || row['Size'] || 'M',
            uniform_type: getUniformTypeFromExcel(row),
            print_style: printStyle,
            note: row['Ghi chú'] || row['Note'] || '',
          };
          
          return player;
        });
        
        if (newPlayers.length > 0) {
          // Update players array
          onPlayersChange(newPlayers);
          toast.success(`Đã nhập ${newPlayers.length} cầu thủ từ file Excel.`);
        }
      } catch (error) {
        console.error('Error reading Excel file:', error);
        toast.error('Đã xảy ra lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file.');
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  return {
    handleExcelImport,
  };
};
