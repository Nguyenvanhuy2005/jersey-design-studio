import { useState, useCallback } from 'react';
import { Player, Logo } from '@/types';

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

  return {
    newPlayer,
    isEditing,
    editingPlayerIndex,
    handleInputChange,
    addOrUpdatePlayer,
    editPlayer,
    removePlayer,
    cancelEdit
  };
};
