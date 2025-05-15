
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Player } from "@/types";
import { Trash2, FileSpreadsheet } from "lucide-react";
import { usePlayerForm } from "@/hooks/usePlayerForm";
import { toast } from "sonner";
import { read, utils } from 'xlsx';

interface PlayerFormProps {
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
  printStyle: string;
}

export function PlayerForm({ players, onPlayersChange, printStyle }: PlayerFormProps) {
  const {
    player,
    errors,
    resetForm,
    handlePlayerChange,
    handleSubmit,
    addPlayer,
    updatePlayer,
    deletePlayer,
    duplicatePlayer,
    importPlayers
  } = usePlayerForm();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Function to add or update player
  const handleAddOrUpdatePlayer = () => {
    const { player: currentPlayer, isValid } = handleSubmit();
    
    if (!isValid) {
      return;
    }

    let updatedPlayers: Player[];
    
    if (isEditing && editingIndex !== null) {
      updatedPlayers = updatePlayer(players, players[editingIndex].id, {
        ...currentPlayer,
        print_style: printStyle
      });
      setIsEditing(false);
      setEditingIndex(null);
      toast.success('Cập nhật cầu thủ thành công');
    } else {
      updatedPlayers = addPlayer(players, {
        ...currentPlayer,
        print_style: printStyle
      });
      toast.success('Thêm cầu thủ thành công');
    }

    onPlayersChange(updatedPlayers);
    resetForm();
  };

  // Function to edit player
  const handleEditPlayer = (index: number) => {
    const playerToEdit = players[index];
    handlePlayerChange(playerToEdit);
    setIsEditing(true);
    setEditingIndex(index);
    
    // Scroll to form
    const formElement = document.getElementById('player-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Function to remove player
  const handleRemovePlayer = (index: number) => {
    const playerToRemove = players[index];
    const updatedPlayers = deletePlayer(players, playerToRemove.id);
    onPlayersChange(updatedPlayers);
    toast.success('Xóa cầu thủ thành công');
    
    // Cancel editing if removing the currently edited player
    if (isEditing && editingIndex === index) {
      handleCancelEdit();
    }
  };

  // Function to cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingIndex(null);
    resetForm();
  };

  // Function to handle Excel import
  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      const file = e.target.files[0];
      const data = await file.arrayBuffer();
      const workbook = read(data);
      
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        toast.error("Không tìm thấy dữ liệu trong file Excel");
        return;
      }
      
      const updatedPlayers = importPlayers(players, jsonData);
      onPlayersChange(updatedPlayers);
      toast.success(`Đã nhập ${jsonData.length} cầu thủ từ Excel`);
    } catch (error) {
      console.error("Excel import error:", error);
      toast.error("Có lỗi khi nhập dữ liệu từ Excel");
    }
    
    // Reset the file input
    e.target.value = '';
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handlePlayerChange({ number: value });
  };

  return (
    <div className="space-y-4" id="player-form">
      <div className="bg-background rounded-lg border p-4">
        <h3 className="font-medium text-lg mb-4">
          {isEditing ? "Chỉnh sửa cầu thủ" : "Thêm cầu thủ"}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên cầu thủ</Label>
            <Input 
              id="name" 
              name="name" 
              value={player.name}
              onChange={(e) => handlePlayerChange({ name: e.target.value })}
              placeholder="Tên cầu thủ"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="number">Số áo</Label>
            <Input 
              id="number" 
              name="number" 
              value={player.number}
              onChange={handleNumberChange}
              placeholder="Số áo"
              className={errors.number ? "border-red-500" : ""}
            />
            {errors.number && (
              <p className="text-xs text-red-500">{errors.number}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="size">Kích thước</Label>
            <Select 
              name="size" 
              value={player.size} 
              onValueChange={(value) => handlePlayerChange({ size: value as Player['size'] })}
            >
              <SelectTrigger className={errors.size ? "border-red-500" : ""}>
                <SelectValue placeholder="Chọn size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="S">S</SelectItem>
                <SelectItem value="M">M</SelectItem>
                <SelectItem value="L">L</SelectItem>
                <SelectItem value="XL">XL</SelectItem>
                <SelectItem value="XXL">XXL</SelectItem>
              </SelectContent>
            </Select>
            {errors.size && (
              <p className="text-xs text-red-500">{errors.size}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="uniform_type">Loại áo</Label>
            <Select 
              name="uniform_type" 
              value={player.uniform_type} 
              onValueChange={(value) => handlePlayerChange({ uniform_type: value as 'player' | 'goalkeeper' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại áo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player">Cầu thủ</SelectItem>
                <SelectItem value="goalkeeper">Thủ môn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <Label htmlFor="note">Ghi chú</Label>
          <Textarea 
            id="note" 
            name="note" 
            value={player.note || ''}
            onChange={(e) => handlePlayerChange({ note: e.target.value })}
            placeholder="Ghi chú thêm (nếu có)" 
            rows={2}
          />
        </div>
        
        <div className="mt-4 flex gap-2">
          <Button type="button" onClick={handleAddOrUpdatePlayer}>
            {isEditing ? "Cập nhật cầu thủ" : "Thêm cầu thủ"}
          </Button>
          
          {isEditing && (
            <Button variant="outline" onClick={handleCancelEdit}>
              Hủy
            </Button>
          )}
          
          <div className="ml-auto">
            <label htmlFor="excel-upload" className="cursor-pointer">
              <div className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Nhập từ Excel
              </div>
              <input 
                id="excel-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
      
      {players.length > 0 && (
        <div className="bg-background rounded-lg border p-4">
          <h3 className="font-medium text-lg mb-4">Danh sách cầu thủ ({players.length})</h3>
          
          <div className="overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">STT</th>
                  <th className="p-2 text-left">Tên cầu thủ</th>
                  <th className="p-2 text-left">Số áo</th>
                  <th className="p-2 text-left">Size</th>
                  <th className="p-2 text-left">Loại áo</th>
                  <th className="p-2 text-left">Ghi chú</th>
                  <th className="p-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr key={player.id} className="border-b border-muted">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{player.name}</td>
                    <td className="p-2">{player.number}</td>
                    <td className="p-2">{player.size}</td>
                    <td className="p-2">
                      {player.uniform_type === 'goalkeeper' ? 'Thủ môn' : 'Cầu thủ'}
                    </td>
                    <td className="p-2">{player.note}</td>
                    <td className="p-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditPlayer(index)}>
                          Sửa
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleRemovePlayer(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
