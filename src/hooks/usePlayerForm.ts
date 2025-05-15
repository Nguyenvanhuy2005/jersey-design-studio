
import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Player } from '@/types';

// Default player used when creating new players
const createDefaultPlayer = (): Player => ({
  id: uuidv4(),
  name: '',
  number: '',
  size: 'M',
  uniform_type: 'player',
  note: '',
  printImage: null,
  line_1: '',
  line_2: '',
  line_3: '',
  print_style: ''
});

export const usePlayerForm = () => {
  const [player, setPlayer] = useState<Player>(createDefaultPlayer());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setPlayer(createDefaultPlayer());
    setErrors({});
  };

  const validatePlayer = (playerToValidate: Player): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!playerToValidate.name?.trim()) {
      newErrors.name = 'Yêu cầu nhập tên cầu thủ';
    }

    if (!playerToValidate.number?.trim()) {
      newErrors.number = 'Yêu cầu nhập số áo';
    }

    if (!playerToValidate.size) {
      newErrors.size = 'Vui lòng chọn kích thước';
    }

    return newErrors;
  };

  const handlePlayerChange = (updatedPlayer: Partial<Player>) => {
    setPlayer(prevPlayer => ({
      ...prevPlayer,
      ...updatedPlayer
    }));

    // Clear errors for fields that are now valid
    const fieldsToCheck = Object.keys(updatedPlayer);
    if (fieldsToCheck.some(field => errors[field])) {
      const updatedErrors = { ...errors };
      fieldsToCheck.forEach(field => {
        const value = updatedPlayer[field as keyof Player];
        if (value && typeof value === 'string' && value.trim() !== '') {
          delete updatedErrors[field];
        }
      });
      setErrors(updatedErrors);
    }
  };

  const handleSubmit = (event?: React.FormEvent): { player: Player; isValid: boolean } => {
    if (event) {
      event.preventDefault();
    }

    const validationErrors = validatePlayer(player);
    setErrors(validationErrors);
    const isValid = Object.keys(validationErrors).length === 0;

    return { player, isValid };
  };

  const addPlayer = (players: Player[], formData: Partial<Player>): Player[] => {
    const newPlayer: Player = {
      ...createDefaultPlayer(),
      ...formData,
      id: uuidv4()
    };

    return [...players, newPlayer];
  };

  const updatePlayer = (players: Player[], playerId: string, formData: Partial<Player>): Player[] => {
    return players.map(p => 
      p.id === playerId 
        ? { ...p, ...formData }
        : p
    );
  };

  const deletePlayer = (players: Player[], playerId: string): Player[] => {
    return players.filter(p => p.id !== playerId);
  };

  const duplicatePlayer = (players: Player[], playerId: string): Player[] => {
    const playerToDuplicate = players.find(p => p.id === playerId);
    if (!playerToDuplicate) return players;

    const duplicatedPlayer: Player = {
      ...playerToDuplicate,
      id: uuidv4(),
      name: `${playerToDuplicate.name} (Copy)`,
    };

    return [...players, duplicatedPlayer];
  };

  const importPlayers = (players: Player[], importedData: any[]): Player[] => {
    if (!importedData || !importedData.length) return players;

    const newPlayers = importedData.map(item => {
      const newPlayer: Player = {
        id: uuidv4(),
        name: item.name || '',
        number: item.number?.toString() || '',
        size: item.size || 'M',
        uniform_type: item.uniform_type || 'player',
        note: item.note || '',
        printImage: null,
        line_1: item.line_1 || '',
        line_2: item.line_2 || '',
        line_3: item.line_3 || '',
        print_style: item.print_style || ''
      };
      return newPlayer;
    });

    return [...players, ...newPlayers];
  };

  return {
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
  };
};
