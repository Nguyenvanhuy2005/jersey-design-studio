import { useState, useCallback } from 'react';
import { Player } from '@/types';

interface UsePlayerFormProps {
  onPlayersChange: (players: Player[]) => void;
  players: Player[];
  printStyle: string;
}

export const usePlayerForm = ({ onPlayersChange, players, printStyle }: UsePlayerFormProps) => {
  const [newPlayer, setNewPlayer] = useState<Player>({
    id: `temp-${Date.now()}`,
    name: "",
    number: "",
    size: "M",
    printImage: true,
    uniform_type: "player",
    line_1: "",
    line_3: "",
    chest_text: "",
    chest_number: false,
    pants_number: false,
    logo_chest_left: false,
    logo_chest_right: false,
    logo_chest_center: false,
    logo_sleeve_left: false,
    logo_sleeve_right: false,
    logo_pants: false,
    print_style: printStyle
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingPlayerIndex, setEditingPlayerIndex] = useState<number | null>(null);

  const handleInputChange = useCallback((field: keyof Player, value: any) => {
    setNewPlayer(prev => ({ ...prev, [field]: value }));
  }, []);

  const addOrUpdatePlayer = useCallback(() => {    
    const updatedPlayers = [...players];
    
    if (isEditing && editingPlayerIndex !== null) {
      updatedPlayers[editingPlayerIndex] = { 
        ...newPlayer, 
        id: players[editingPlayerIndex].id 
      };
      onPlayersChange(updatedPlayers);
      setIsEditing(false);
      setEditingPlayerIndex(null);
    } else {
      updatedPlayers.push({ ...newPlayer, id: `player-${Date.now()}` });
      onPlayersChange(updatedPlayers);
    }
    
    setNewPlayer({
      id: `temp-${Date.now()}`,
      name: "",
      number: "",
      size: "M",
      printImage: true,
      uniform_type: "player",
      line_1: "",
      line_3: "",
      chest_text: "",
      chest_number: false,
      pants_number: false,
      logo_chest_left: false,
      logo_chest_right: false,
      logo_chest_center: false,
      logo_sleeve_left: false,
      logo_sleeve_right: false,
      logo_pants: false,
      print_style: printStyle
    });
  }, [newPlayer, players, onPlayersChange, isEditing, editingPlayerIndex, printStyle]);

  const editPlayer = useCallback((index: number) => {
    const playerToEdit = players[index];
    setNewPlayer({
      ...playerToEdit,
      line_1: playerToEdit.line_1 || playerToEdit.name || "",
      line_3: playerToEdit.line_3 || "",
    });
    setIsEditing(true);
    setEditingPlayerIndex(index);
  }, [players]);

  const removePlayer = useCallback((index: number) => {
    const updatedPlayers = [...players];
    updatedPlayers.splice(index, 1);
    onPlayersChange(updatedPlayers);
    
    if (isEditing && editingPlayerIndex === index) {
      setIsEditing(false);
      setEditingPlayerIndex(null);
      setNewPlayer({
        id: `temp-${Date.now()}`,
        name: "",
        number: "",
        size: "M",
        printImage: true,
        uniform_type: "player",
        line_1: "",
        line_3: "",
        chest_text: "",
        chest_number: false,
        pants_number: false,
        logo_chest_left: false,
        logo_chest_right: false,
        logo_chest_center: false,
        logo_sleeve_left: false,
        logo_sleeve_right: false,
        logo_pants: false,
        print_style: printStyle
      });
    }
  }, [players, onPlayersChange, isEditing, editingPlayerIndex, printStyle]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditingPlayerIndex(null);
    setNewPlayer({
      id: `temp-${Date.now()}`,
      name: "",
      number: "",
      size: "M",
      printImage: true,
      uniform_type: "player",
      line_1: "",
      line_3: "",
      chest_text: "",
      chest_number: false,
      pants_number: false,
      logo_chest_left: false,
      logo_chest_right: false,
      logo_chest_center: false,
      logo_sleeve_left: false,
      logo_sleeve_right: false,
      logo_pants: false,
      print_style: printStyle
    });
  }, [printStyle]);

  // Helper function to convert Vietnamese Yes/No to boolean
  const convertVietnameseToBoolean = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.toLowerCase().trim();
      return normalized === 'có' || normalized === 'co' || 
             normalized === 'yes' || normalized === 'true' || 
             normalized === 'ok';
    }
    return false;
  };

  // Helper function to handle Excel import
  const handleExcelImport = (data: any[]): Player[] => {
    return data.map((row, index) => {
      // Handle player number formats
      let playerNumber: string = "";
      if (row["SỐ ÁO"] !== undefined) {
        playerNumber = String(row["SỐ ÁO"]).padStart(2, '0');
      } else if (row["SỐ"] !== undefined) {
        playerNumber = String(row["SỐ"]).padStart(2, '0');
      }

      // Default values for required fields
      const uniformType = (row["LOẠI QUẦN ÁO"]?.toLowerCase() === "thủ môn" || 
                          row["LOẠI QUẦN ÁO"]?.toLowerCase() === "thu mon") ? "goalkeeper" : "player";
                          
      const size = row["KÍCH THƯỚC"] || "M";
      
      return {
        id: `player-${Date.now()}-${index}`,
        name: row["TÊN CẦU THỦ"] || "",
        number: playerNumber,
        size: size,
        printImage: true,
        uniform_type: uniformType,
        line_1: row["TÊN IN TRÊN SỐ"] || "",
        line_2: playerNumber,
        line_3: row["TÊN ĐỘI BÓNG"] || "",
        chest_text: row["IN CHỮ NGỰC"] || "",
        chest_number: convertVietnameseToBoolean(row["IN SỐ NGỰC"]),
        pants_number: convertVietnameseToBoolean(row["IN SỐ QUẦN"]),
        logo_chest_left: convertVietnameseToBoolean(row["LOGO NGỰC TRÁI"]),
        logo_chest_right: convertVietnameseToBoolean(row["LOGO NGỰC PHẢI"]),
        logo_chest_center: convertVietnameseToBoolean(row["LOGO NGỰC GIỮA"]),
        logo_sleeve_left: convertVietnameseToBoolean(row["LOGO TAY TRÁI"]),
        logo_sleeve_right: convertVietnameseToBoolean(row["LOGO TAY PHẢI"]),
        logo_pants: convertVietnameseToBoolean(row["LOGO QUẦN"]),
        note: row["GHI CHÚ"] || "",
        print_style: row["KIỂU IN"] || printStyle
      };
    });
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
    handleExcelImport,
    convertVietnameseToBoolean
  };
};
