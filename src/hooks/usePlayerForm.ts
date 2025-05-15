
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Player } from "@/types";

export interface UsePlayerFormProps {
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
  printStyle: string;
}

export function usePlayerForm({ players, onPlayersChange, printStyle }: UsePlayerFormProps) {
  const [newPlayer, setNewPlayer] = useState<Player>({
    id: uuidv4(),
    name: "",
    number: "",
    size: "M",
    uniform_type: "player",
    print_style: printStyle,
    note: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlayerIndex, setEditingPlayerIndex] = useState(-1);

  // Handle player form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPlayer((prev) => ({ ...prev, [name]: value }));
  };

  // Add or update player
  const addOrUpdatePlayer = () => {
    if (!newPlayer.name.trim()) {
      toast.error("Vui lòng nhập tên cầu thủ");
      return;
    }

    if (!newPlayer.number.trim()) {
      toast.error("Vui lòng nhập số áo");
      return;
    }

    if (isEditing && editingPlayerIndex > -1) {
      const updatedPlayers = [...players];
      updatedPlayers[editingPlayerIndex] = { ...newPlayer };
      onPlayersChange(updatedPlayers);
    } else {
      onPlayersChange([...players, { ...newPlayer, id: uuidv4() }]);
    }

    // Reset form
    setNewPlayer({
      id: uuidv4(),
      name: "",
      number: "",
      size: "M",
      uniform_type: "player",
      print_style: printStyle,
      note: ""
    });
    setIsEditing(false);
    setEditingPlayerIndex(-1);
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

  // Helper function to determine uniform type from Excel data
  const getUniformTypeFromExcel = (row: any): "goalkeeper" | "player" => {
    const position = row['Vị trí'] || row['Position'] || '';
    if (position.toLowerCase().includes('thủ môn') || position.toLowerCase().includes('goalkeeper')) {
      return 'goalkeeper';
    }
    return 'player';
  };

  // Edit player
  const editPlayer = (index: number) => {
    setNewPlayer({ ...players[index] });
    setIsEditing(true);
    setEditingPlayerIndex(index);
  };

  // Remove player
  const removePlayer = (index: number) => {
    const updatedPlayers = [...players];
    updatedPlayers.splice(index, 1);
    onPlayersChange(updatedPlayers);
  };

  // Cancel edit
  const cancelEdit = () => {
    setNewPlayer({
      id: uuidv4(),
      name: "",
      number: "",
      size: "M",
      uniform_type: "player",
      print_style: printStyle,
      note: ""
    });
    setIsEditing(false);
    setEditingPlayerIndex(-1);
  };

  return {
    newPlayer,
    isEditing,
    editingPlayerIndex,
    handleInputChange,
    addOrUpdatePlayer,
    editPlayer,
    removePlayer,
    cancelEdit,
    handleExcelImport
  };
}
