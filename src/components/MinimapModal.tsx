import React from 'react';
import { Room } from '../types/game';
import { Compass, Skull, Shield, Check, MapPin, X } from 'lucide-react';

interface MinimapModalProps {
  rooms: Record<string, Room>;
  currentRoomId: string;
  onClose: () => void;
}

interface MapNode {
  id: string;
  name: string;
  tier: string;
  col: number; // 0, 1, 2
  row: number; // 0, 1, 2, 3
  isBoss?: boolean;
}

const GRAPH_NODES: MapNode[] = [
  {
    id: 'room_entrance',
    name: 'The Weeping Threshold',
    tier: 'Gate Chamber #01',
    col: 1,
    row: 3,
  },
  {
    id: 'room_scriptorium',
    name: 'The Scriptorium of Ashes',
    tier: 'Ancient Archive #02',
    col: 1,
    row: 2,
  },
  {
    id: 'room_crypt',
    name: 'The Flooded Crypt',
    tier: 'Sunken Catacombs #03',
    col: 1,
    row: 1,
  },
  {
    id: 'room_sanctum',
    name: 'Sanctum of the Iron Warden',
    tier: 'Boss Chamber #04',
    col: 1,
    row: 0,
    isBoss: true,
  },
];

export const MinimapModal: React.FC<MinimapModalProps> = ({ rooms, currentRoomId, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0e111a] border border-[#2e374f] rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#1e2538] pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-cinzel text-gray-100">
                THE SUNKEN RELIQUARY — TOPOLOGY
              </h3>
              <p className="text-[11px] font-mono text-gray-400">
                Guild Macro-Graph Dungeon Chart
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a2030] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Node Graph Visualizer */}
        <div className="py-2 flex flex-col items-center space-y-4 relative">
          {GRAPH_NODES.map((node, idx) => {
            const roomData = rooms[node.id];
            const isCurrent = currentRoomId === node.id;
            const isVisited = roomData?.visited;
            const isCleared = roomData && !roomData.enemies.some((e) => e.hp > 0);

            return (
              <div key={node.id} className="w-full flex flex-col items-center">
                {/* Connecting Rune Line (if not top) */}
                {idx > 0 && (
                  <div className="w-0.5 h-6 bg-gradient-to-b from-amber-500/40 to-amber-500/10 mb-1" />
                )}

                {/* Node Card */}
                <div
                  className={`w-full max-w-md p-4 rounded-xl border transition-all duration-300 relative ${
                    isCurrent
                      ? 'border-amber-400 bg-[#161a28] shadow-lg shadow-amber-950/40 ring-2 ring-amber-400/30 transform scale-[1.02]'
                      : isVisited
                      ? 'border-[#2a344a] bg-[#111420] text-gray-300'
                      : 'border-[#1a1f2e] bg-[#090b10] text-gray-600 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Node Icon */}
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                          node.isBoss
                            ? 'bg-red-950/60 border border-red-500/40 text-red-400'
                            : isCurrent
                            ? 'bg-amber-950/60 border border-amber-500/50 text-amber-300'
                            : isVisited
                            ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400'
                            : 'bg-[#141824] border border-[#232a3d] text-gray-500'
                        }`}
                      >
                        {node.isBoss ? (
                          <Skull className="w-4 h-4" />
                        ) : isCurrent ? (
                          <MapPin className="w-4 h-4 animate-bounce" />
                        ) : isCleared ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Shield className="w-4 h-4" />
                        )}
                      </div>

                      {/* Node Text */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold font-cinzel text-gray-100">
                            {node.name}
                          </h4>
                          {isCurrent && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                              YOU ARE HERE
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-gray-400">
                          {node.tier}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="text-right">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          isCurrent
                            ? 'bg-amber-950/80 border-amber-500/60 text-amber-300'
                            : isCleared
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                            : isVisited
                            ? 'bg-blue-950/60 border-blue-500/40 text-blue-300'
                            : 'bg-[#111420] border-[#222838] text-gray-600'
                        }`}
                      >
                        {isCurrent
                          ? 'ACTIVE'
                          : isCleared
                          ? 'CLEARED'
                          : isVisited
                          ? 'EXPLORING'
                          : 'LOCKED'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Hint */}
        <div className="mt-6 pt-4 border-t border-[#1e2538] flex items-center justify-between text-[11px] font-mono text-gray-400">
          <span>Objective: Defeat Iron Warden in Chamber #04</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#181d2c] hover:bg-[#252c42] border border-[#2b354d] text-gray-200 transition"
          >
            Close Chart
          </button>
        </div>
      </div>
    </div>
  );
};
