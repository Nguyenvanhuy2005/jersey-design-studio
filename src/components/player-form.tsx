
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Player } from "@/types";
import { Trash2, FileSpreadsheet } from "lucide-react";
import { usePlayerForm } from "@/hooks/usePlayerForm";

interface PlayerFormProps {
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
  printStyle: string;
}

export function PlayerForm({ players, onPlayersChange, printStyle }: PlayerFormProps) {
  const {
    newPlayer,
    isEditing,
    editingPlayerIndex,
    handleInputChange,
    addOrUpdatePlayer,
    editPlayer,
    removePlayer,
    cancelEdit,
    handleExcelImport
  } = usePlayerForm({ players, onPlayersChange, printStyle });

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Use the handleInputChange provided by the hook
    handleInputChange({
      target: { name: 'number', value }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-lg border p-4">
        <h3 className="font-medium text-lg mb-4">Thêm cầu thủ</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên cầu thủ</Label>
            <Input 
              id="name" 
              name="name" 
              value={newPlayer.name}
              onChange={handleInputChange}
              placeholder="Tên cầu thủ" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="number">Số áo</Label>
            <Input 
              id="number" 
              name="number" 
              value={newPlayer.number}
              onChange={handleNumberChange}
              placeholder="Số áo" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="size">Kích thước</Label>
            <Select 
              name="size" 
              value={newPlayer.size} 
              onValueChange={(value) => handleInputChange({
                target: { name: 'size', value }
              } as React.ChangeEvent<HTMLSelectElement>)}
            >
              <SelectTrigger>
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="uniform_type">Loại áo</Label>
            <Select 
              name="uniform_type" 
              value={newPlayer.uniform_type} 
              onValueChange={(value) => handleInputChange({
                target: { name: 'uniform_type', value }
              } as React.ChangeEvent<HTMLSelectElement>)}
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
            value={newPlayer.note}
            onChange={handleInputChange}
            placeholder="Ghi chú thêm (nếu có)" 
            rows={2}
          />
        </div>
        
        <div className="mt-4 flex gap-2">
          <Button type="button" onClick={addOrUpdatePlayer}>
            {isEditing ? "Cập nhật cầu thủ" : "Thêm cầu thủ"}
          </Button>
          
          {isEditing && (
            <Button variant="outline" onClick={cancelEdit}>
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
                        <Button variant="ghost" size="sm" onClick={() => editPlayer(index)}>
                          Sửa
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => removePlayer(index)}>
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
