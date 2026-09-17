import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Entity, Room, Skill, TileType } from '../types/game';

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
  lifetime: number;
}

interface CanvasGridProps {
  room: Room;
  player: Entity;
  enemies: Entity[];
  selectedSkill: Skill | null;
  floatingTexts: FloatingText[];
  onTileClick: (x: number, y: number) => void;
  onEnemyClick: (enemy: Entity) => void;
  onInteractableClick: (id: string) => void;
}

export const CanvasGrid: React.FC<CanvasGridProps> = ({
  room,
  player,
  enemies,
  selectedSkill,
  floatingTexts,
  onTileClick,
  onEnemyClick,
  onInteractableClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);

  // Dynamic Tile Size calculation
  const TILE_SIZE = 48;
  const canvasWidth = room.width * TILE_SIZE;
  const canvasHeight = room.height * TILE_SIZE;

  // Helper to parse tile from layout ASCII
  const getTileTypeAt = useCallback(
    (x: number, y: number): { type: TileType; char: string } => {
      if (y < 0 || y >= room.layout.length || x < 0 || x >= room.layout[0].length) {
        return { type: 'wall', char: '#' };
      }
      const char = room.layout[y][x];
      switch (char) {
        case '#':
          return { type: 'wall', char };
        case '~':
          return { type: 'rubble', char };
        case '^':
          return { type: 'hazard', char };
        case 'D':
        case 'S':
          return { type: 'door', char };
        case 'A':
          return { type: 'altar', char };
        case 'C':
          return { type: 'chest', char };
        case 'B':
          return { type: 'bookshelf', char };
        case 'R':
          return { type: 'altar', char }; // Relic pedestal
        default:
          return { type: 'floor', char: '.' };
      }
    },
    [room]
  );

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 1. Draw Grid Tiles
    for (let y = 0; y < room.height; y++) {
      for (let x = 0; x < room.width; x++) {
        const { type } = getTileTypeAt(x, y);
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        if (type === 'wall') {
          // Dark stone brick
          ctx.fillStyle = '#161924';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = '#22283a';
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);

          // Bevel highlight
          ctx.fillStyle = '#2b334a';
          ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, 3);
        } else {
          // Floor base
          ctx.fillStyle = (x + y) % 2 === 0 ? '#0f1118' : '#121520';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = '#1a1f2c';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);

          // Specific Floor Overlays
          if (type === 'rubble') {
            // Difficult Terrain
            ctx.fillStyle = '#2d3345';
            ctx.beginPath();
            ctx.arc(px + 16, py + 18, 7, 0, Math.PI * 2);
            ctx.arc(px + 30, py + 28, 9, 0, Math.PI * 2);
            ctx.arc(px + 24, py + 14, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#94a3b8';
            ctx.font = '10px monospace';
            ctx.fillText('~', px + TILE_SIZE / 2 - 3, py + TILE_SIZE - 6);
          } else if (type === 'hazard') {
            // Web / Spikes
            ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

            ctx.strokeStyle = 'rgba(192, 132, 252, 0.4)';
            ctx.beginPath();
            ctx.moveTo(px + 4, py + 4);
            ctx.lineTo(px + TILE_SIZE - 4, py + TILE_SIZE - 4);
            ctx.moveTo(px + TILE_SIZE - 4, py + 4);
            ctx.lineTo(px + 4, py + TILE_SIZE - 4);
            ctx.stroke();

            ctx.fillStyle = '#c084fc';
            ctx.font = '11px sans-serif';
            ctx.fillText('🕸️', px + 15, py + 28);
          } else if (type === 'door') {
            // Glowing dungeon exit
            ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.strokeRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);

            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText('🚪', px + 15, py + 28);
          } else if (type === 'altar') {
            // Altar / Relic
            ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#eab308';
            ctx.strokeRect(px + 6, py + 6, TILE_SIZE - 12, TILE_SIZE - 12);
            ctx.fillText('✨', px + 16, py + 28);
          } else if (type === 'chest') {
            ctx.fillText('📦', px + 16, py + 28);
          } else if (type === 'bookshelf') {
            ctx.fillText('📚', px + 16, py + 28);
          }
        }
      }
    }

    // 2. Skill Range Overlay (if a skill is active)
    if (selectedSkill) {
      const range = selectedSkill.range;
      for (let y = 0; y < room.height; y++) {
        for (let x = 0; x < room.width; x++) {
          const dist = Math.max(Math.abs(player.x - x), Math.abs(player.y - y));
          if (dist <= range && dist > 0) {
            const px = x * TILE_SIZE;
            const py = y * TILE_SIZE;
            ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          }
        }
      }
    }

    // 3. Movement Range Overlay (if free roam or has remaining speed)
    if (!selectedSkill && player.remainingSpeed > 0 && player.hp > 0) {
      const maxMove = player.remainingSpeed;
      for (let y = 0; y < room.height; y++) {
        for (let x = 0; x < room.width; x++) {
          const { type } = getTileTypeAt(x, y);
          if (type !== 'wall') {
            const dist = Math.abs(player.x - x) + Math.abs(player.y - y); // Manhattan
            if (dist <= maxMove && (x !== player.x || y !== player.y)) {
              const px = x * TILE_SIZE;
              const py = y * TILE_SIZE;
              ctx.fillStyle = 'rgba(56, 189, 248, 0.07)';
              ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            }
          }
        }
      }
    }

    // 4. Hovered Tile Outline
    if (hoveredTile) {
      const px = hoveredTile.x * TILE_SIZE;
      const py = hoveredTile.y * TILE_SIZE;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    }

    // 5. Render Enemies
    enemies.forEach((enemy) => {
      if (enemy.hp <= 0) return; // Dead
      const ex = enemy.x * TILE_SIZE + TILE_SIZE / 2;
      const ey = enemy.y * TILE_SIZE + TILE_SIZE / 2;
      const radius = 18;

      // Enemy Circle Body
      ctx.save();
      ctx.beginPath();
      ctx.arc(ex, ey, radius, 0, Math.PI * 2);
      ctx.fillStyle = enemy.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Enemy Icon Letter / Symbol
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(enemy.name.charAt(0), ex, ey);

      // HP Bar above head
      const barWidth = 36;
      const barHeight = 4;
      const barX = ex - barWidth / 2;
      const barY = ey - radius - 8;

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(barX, barY, (enemy.hp / enemy.maxHp) * barWidth, barHeight);
      ctx.restore();
    });

    // 6. Render Player Hero Token
    const px = player.x * TILE_SIZE + TILE_SIZE / 2;
    const py = player.y * TILE_SIZE + TILE_SIZE / 2;
    const pRadius = 19;

    ctx.save();
    // Inspiration Glow Aura
    if (player.conditions.includes('inspired')) {
      ctx.beginPath();
      ctx.arc(px, py, pRadius + 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Player Body
    ctx.beginPath();
    ctx.arc(px, py, pRadius, 0, Math.PI * 2);
    ctx.fillStyle = player.hp <= 0 ? '#450a0a' : player.color;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = player.hp <= 0 ? '#ef4444' : '#fbbf24';
    ctx.stroke();

    // Player Symbol
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.hp <= 0 ? '💀' : '⚔️', px, py);
    ctx.restore();

    // 6.5. Atmospheric Dungeon Torchlight & Vignette
    ctx.save();
    const lightRadius = 190;
    const lightGrad = ctx.createRadialGradient(px, py, 25, px, py, lightRadius);
    lightGrad.addColorStop(0, 'rgba(251, 191, 36, 0.08)');
    lightGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.05)');
    lightGrad.addColorStop(1, 'rgba(5, 7, 12, 0.7)');
    ctx.fillStyle = lightGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();

    // 7. Render Floating Damage Numbers
    floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = ft.opacity;
      ctx.font = 'bold 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#050608';
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }, [
    room,
    player,
    enemies,
    selectedSkill,
    floatingTexts,
    hoveredTile,
    canvasWidth,
    canvasHeight,
    getTileTypeAt,
  ]);

  // Mouse Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((clientX * scaleX) / TILE_SIZE);
    const y = Math.floor((clientY * scaleY) / TILE_SIZE);

    if (x >= 0 && x < room.width && y >= 0 && y < room.height) {
      setHoveredTile({ x, y });
    } else {
      setHoveredTile(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredTile(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const tx = Math.floor((clientX * scaleX) / TILE_SIZE);
    const ty = Math.floor((clientY * scaleY) / TILE_SIZE);

    // 1. Check if clicked an enemy
    const clickedEnemy = enemies.find((en) => en.x === tx && en.y === ty && en.hp > 0);
    if (clickedEnemy) {
      onEnemyClick(clickedEnemy);
      return;
    }

    // 2. Check if clicked an interactable
    const clickedInteractable = room.interactables.find(
      (item) => item.x === tx && item.y === ty && !item.resolved
    );
    if (clickedInteractable) {
      onInteractableClick(clickedInteractable.id);
      return;
    }

    // 3. Otherwise general tile click (movement or exit)
    onTileClick(tx, ty);
  };

  return (
    <div className="flex items-center justify-center p-2">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="rounded-xl border border-[#23293d] shadow-2xl bg-[#090b10] cursor-crosshair max-w-full max-h-full object-contain"
      />
    </div>
  );
};
