
import React from "react";
import { Player } from "@/types";
import { Button } from "@/components/ui/button";
import { ShieldCheck, UserRound } from "lucide-react";

interface PlayerSelectorProps {
  players: Player[];
  selectedIdx: number;
  onSelect: (index: number) => void;
}

export function PlayerSelector({ players, selectedIdx, onSelect }: PlayerSelectorProps) {
  if (players.length <= 1) return null;

  return (
    <div className="flex flex-wrap gap-3 items-center px-4 pt-4 pb-1">
      <span className="mr-2 text-gray-500 shrink-0">Xem demo của:</span>
      <div className="flex gap-2 overflow-x-auto">
        {players.map((p, idx) => {
          const isGoalkeeper = p.uniform_type === "goalkeeper";
          const selected = idx === selectedIdx;
          return (
            <Button
              key={p.id}
              variant={selected ? "default" : "outline"}
              className={`flex items-center px-3 py-1.5 rounded-full gap-2 shadow-sm border text-sm transition-all ${
                selected ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => onSelect(idx)}
            >
              <span className="inline-flex items-center justify-center">
                {isGoalkeeper ? (
                  <ShieldCheck className="w-5 h-5 text-green-700 mr-1" />
                ) : (
                  <UserRound className="w-5 h-5 text-blue-700 mr-1" />
                )}
              </span>
              <span className="truncate max-w-[80px]">{p.name}</span>
              {isGoalkeeper && (
                <span className="ml-1 text-xs bg-green-100 text-green-800 rounded px-1.5 py-0.5 font-semibold">Thủ môn</span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
