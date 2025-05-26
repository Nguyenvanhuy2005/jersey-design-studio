import React from "react";
import { Player } from "@/types";
import { Button } from "@/components/ui/button";
import { ShieldCheck, UserRound } from "lucide-react";
interface PlayerSelectorProps {
  players: Player[];
  selectedIdx: number;
  onSelect: (index: number) => void;
}
export function PlayerSelector({
  players,
  selectedIdx,
  onSelect
}: PlayerSelectorProps) {
  if (players.length <= 1) return null;
  return;
}