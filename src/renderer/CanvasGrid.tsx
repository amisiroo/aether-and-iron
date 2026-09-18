import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Entity, Room, Skill, TileType } from '../types/game';
import { Point } from '../core/map';

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
  onTileHover?: (x: number, y: number) => void;
  onEnemyClick: (enemy: Entity) => void;
  movementPath?: Point[];
  movementCost?: number;
  movementInvalidReason?: string;
  onInteractableClick: (id: string) => void;
}

export const CanvasGrid: React.FC<CanvasGridProps> = ({
  room,
  player,
  enemies,
  selectedSkill,
  floatingTexts,
  onTileClick,
  onTileHover,
  onEnemyClick,
  movementPath = [],
  movementCost,
  movementInvalidReason,
  onInteractableClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);

  const TILE_SIZE = 48;
  const canvasWidth = room.width * TILE_SIZE;
  const canvasHeight = room.height * TILE_SIZE;

  // Parse tile from layout ASCII
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

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 1. RENDER TILES WITH ENHANCED FANTASY ART
    for (let y = 0; y < room.height; y++) {
      for (let x = 0; x < room.width; x++) {
        const { type, char } = getTileTypeAt(x, y);
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        if (type === 'wall') {
          // --- WALL TILE: Ancient Heavy Stonework ---
          ctx.fillStyle = '#111420';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

          // Brick pattern grooves
          ctx.strokeStyle = '#1d2334';
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);

          // Top Stone Bevel Highlight
          ctx.fillStyle = '#263047';
          ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, 3);
          ctx.fillStyle = '#1a2233';
          ctx.fillRect(px + 2, py + 5, 3, TILE_SIZE - 8);

          // Center Mortar Split (staggered bricks)
          if ((x + y) % 2 === 0) {
            ctx.strokeStyle = '#181e2d';
            ctx.beginPath();
            ctx.moveTo(px + TILE_SIZE / 2, py + 4);
            ctx.lineTo(px + TILE_SIZE / 2, py + TILE_SIZE - 4);
            ctx.stroke();
          }
        } else {
          // --- FLOOR TILE: Dungeon Flagstones ---
          const isAlt = (x + y) % 2 === 0;
          ctx.fillStyle = isAlt ? '#0c0e15' : '#0f121a';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

          // Subtle paver border
          ctx.strokeStyle = '#181d29';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);

          // Subtle floor texture dot
          if ((x * 3 + y * 7) % 5 === 0) {
            ctx.fillStyle = '#1c2233';
            ctx.fillRect(px + 12, py + 14, 2, 2);
            ctx.fillRect(px + 32, py + 28, 2, 2);
          }

          // SPECIFIC OVERLAYS
          if (type === 'rubble') {
            // --- DIFFICULT TERRAIN: Shattered Boulders & Rubble ---
            // Large Boulder
            ctx.fillStyle = '#333c52';
            ctx.beginPath();
            ctx.arc(px + 18, py + 20, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#475569';
            ctx.beginPath();
            ctx.arc(px + 16, py + 18, 4, 0, Math.PI * 2);
            ctx.fill();

            // Medium Rock
            ctx.fillStyle = '#252d3d';
            ctx.beginPath();
            ctx.arc(px + 32, py + 28, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#374151';
            ctx.beginPath();
            ctx.arc(px + 30, py + 26, 5, 0, Math.PI * 2);
            ctx.fill();

            // Small Pebbles
            ctx.fillStyle = '#64748b';
            ctx.fillRect(px + 12, py + 34, 3, 3);
            ctx.fillRect(px + 24, py + 12, 4, 3);
            ctx.fillRect(px + 36, py + 16, 3, 4);

            // Rubble Sign
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 10px monospace';
            ctx.fillText('~', px + TILE_SIZE - 12, py + TILE_SIZE - 4);
          } else if (type === 'hazard') {
            // --- HAZARD TILE: Arachnid Webs & Ground Spikes ---
            ctx.fillStyle = 'rgba(147, 51, 234, 0.12)';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

            // Spun Silk Web Geometry
            ctx.strokeStyle = 'rgba(192, 132, 252, 0.45)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            // Radial Spokes
            ctx.moveTo(px + 4, py + 4);
            ctx.lineTo(px + TILE_SIZE - 4, py + TILE_SIZE - 4);
            ctx.moveTo(px + TILE_SIZE - 4, py + 4);
            ctx.lineTo(px + 4, py + TILE_SIZE - 4);
            ctx.moveTo(px + TILE_SIZE / 2, py + 2);
            ctx.lineTo(px + TILE_SIZE / 2, py + TILE_SIZE - 2);
            // Spiral Rings
            ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 8, 0, Math.PI * 2);
            ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 16, 0, Math.PI * 2);
            ctx.stroke();

            // Subtle purple hazard particle
            ctx.fillStyle = '#c084fc';
            ctx.font = '11px sans-serif';
            ctx.fillText('🕸️', px + 15, py + 30);
          } else if (type === 'door') {
            // --- DOOR / PASSAGEWAY: Glowing Stone Archway ---
            ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

            // Portal Frame
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.strokeRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);

            // Arch Curve
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE / 2, py + 16, 12, Math.PI, 0);
            ctx.strokeStyle = '#fbbf24';
            ctx.stroke();

            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText('🚪', px + 15, py + 30);
          } else if (type === 'altar') {
            // --- ALTAR / SACRED DAIS ---
            ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(px + 6, py + 6, TILE_SIZE - 12, TILE_SIZE - 12);

            if (char === 'R') {
              // The Obsidian Heart Relic (Glowing Dark Diamond)
              ctx.save();
              ctx.fillStyle = '#a855f7';
              ctx.shadowColor = '#c084fc';
              ctx.shadowBlur = 8;
              ctx.beginPath();
              ctx.moveTo(px + TILE_SIZE / 2, py + 10);
              ctx.lineTo(px + TILE_SIZE / 2 + 10, py + TILE_SIZE / 2);
              ctx.lineTo(px + TILE_SIZE / 2, py + TILE_SIZE - 10);
              ctx.lineTo(px + TILE_SIZE / 2 - 10, py + TILE_SIZE / 2);
              ctx.closePath();
              ctx.fill();
              ctx.restore();
            } else {
              ctx.fillStyle = '#fde047';
              ctx.font = '14px sans-serif';
              ctx.fillText('✨', px + 16, py + 29);
            }
          } else if (type === 'chest') {
            // --- OAK CHEST WITH GILDED BANDS ---
            ctx.fillStyle = '#78350f';
            ctx.fillRect(px + 8, py + 12, TILE_SIZE - 16, TILE_SIZE - 20);
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(px + 8, py + 12, TILE_SIZE - 16, TILE_SIZE - 20);
            // Iron Latch
            ctx.fillStyle = '#fde047';
            ctx.fillRect(px + TILE_SIZE / 2 - 2, py + 18, 4, 6);
          } else if (type === 'bookshelf') {
            // --- ARCHIVE BOOKSHELF ---
            ctx.fillStyle = '#451a03';
            ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            ctx.strokeStyle = '#78350f';
            ctx.strokeRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            // Books
            const colors = ['#dc2626', '#2563eb', '#16a34a', '#ca8a04', '#9333ea'];
            for (let i = 0; i < 4; i++) {
              ctx.fillStyle = colors[i % colors.length];
              ctx.fillRect(px + 8 + i * 8, py + 10, 6, 18);
            }
          }
        }
      }
    }

    // 2. SKILL RANGE OVERLAY
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
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          }
        }
      }
    }

    // 3. MOVEMENT RANGE OVERLAY
    if (!selectedSkill && player.remainingSpeed > 0 && player.hp > 0) {
      const maxMove = player.remainingSpeed;
      for (let y = 0; y < room.height; y++) {
        for (let x = 0; x < room.width; x++) {
          const { type } = getTileTypeAt(x, y);
          if (type !== 'wall') {
            const dist = Math.abs(player.x - x) + Math.abs(player.y - y);
            if (dist <= maxMove && (x !== player.x || y !== player.y)) {
              const px = x * TILE_SIZE;
              const py = y * TILE_SIZE;
              ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
              ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            }
          }
        }
      }
    }

    // 4. HOVERED TILE OUTLINE
    movementPath.forEach((point, index) => {
      ctx.fillStyle = index === 0 ? 'rgba(34, 197, 94, 0.22)' : 'rgba(56, 189, 248, 0.18)';
      ctx.fillRect(point.x * TILE_SIZE, point.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(point.x * TILE_SIZE + 4, point.y * TILE_SIZE + 4, TILE_SIZE - 8, TILE_SIZE - 8);
    });
    if (hoveredTile) {
      const px = hoveredTile.x * TILE_SIZE;
      const py = hoveredTile.y * TILE_SIZE;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    }

    // 5. RENDER ENEMIES WITH CUSTOM VECTOR TOKEN ART
    enemies.forEach((enemy) => {
      if (enemy.hp <= 0) return;
      const ex = enemy.x * TILE_SIZE + TILE_SIZE / 2;
      const ey = enemy.y * TILE_SIZE + TILE_SIZE / 2;
      const isBoss = enemy.id.includes('boss') || enemy.id.includes('warden');
      const radius = isBoss ? 23 : 18;

      ctx.save();
      // Drop Shadow
      ctx.beginPath();
      ctx.arc(ex, ey + 2, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fill();

      // Enemy Base Circle
      ctx.beginPath();
      ctx.arc(ex, ey, radius, 0, Math.PI * 2);
      const enemyGrad = ctx.createRadialGradient(ex, ey, 2, ex, ey, radius);
      if (isBoss) {
        enemyGrad.addColorStop(0, '#7f1d1d');
        enemyGrad.addColorStop(1, '#180404');
      } else if (enemy.name.includes('Spider')) {
        enemyGrad.addColorStop(0, '#581c87');
        enemyGrad.addColorStop(1, '#090514');
      } else {
        enemyGrad.addColorStop(0, '#3f3f46');
        enemyGrad.addColorStop(1, '#09090b');
      }
      ctx.fillStyle = enemyGrad;
      ctx.fill();

      // Border Trim
      ctx.lineWidth = isBoss ? 2.5 : 1.8;
      ctx.strokeStyle = isBoss ? '#dc2626' : enemy.color || '#ef4444';
      ctx.stroke();

      // Internal Fantasy Token Motif
      if (isBoss) {
        // Horned Crown of the Warden
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(ex - 8, ey - 4);
        ctx.lineTo(ex - 12, ey - 12);
        ctx.lineTo(ex - 4, ey - 6);
        ctx.lineTo(ex, ey - 14);
        ctx.lineTo(ex + 4, ey - 6);
        ctx.lineTo(ex + 12, ey - 12);
        ctx.lineTo(ex + 8, ey - 4);
        ctx.closePath();
        ctx.fill();

        // 3 Glowing Red Slits
        ctx.fillStyle = '#fee2e2';
        ctx.fillRect(ex - 6, ey + 1, 3, 2);
        ctx.fillRect(ex - 1, ey - 1, 3, 2);
        ctx.fillRect(ex + 4, ey + 1, 3, 2);
      } else if (enemy.name.includes('Spider')) {
        // Arachnid Eyes (6 glowing red dots)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(ex - 5, ey - 3, 1.8, 0, Math.PI * 2);
        ctx.arc(ex + 5, ey - 3, 1.8, 0, Math.PI * 2);
        ctx.arc(ex - 2, ey - 6, 1.4, 0, Math.PI * 2);
        ctx.arc(ex + 2, ey - 6, 1.4, 0, Math.PI * 2);
        ctx.arc(ex - 6, ey + 2, 1.2, 0, Math.PI * 2);
        ctx.arc(ex + 6, ey + 2, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Chelicerae Fangs
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ex - 4, ey + 5);
        ctx.lineTo(ex - 2, ey + 9);
        ctx.moveTo(ex + 4, ey + 5);
        ctx.lineTo(ex + 2, ey + 9);
        ctx.stroke();
      } else {
        // Skeletal Skull Motif
        ctx.fillStyle = '#f4f4f5';
        ctx.beginPath();
        ctx.arc(ex, ey - 2, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(ex - 4, ey + 2, 8, 4);

        // Crimson Eye Sockets
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(ex - 4, ey - 3, 2.5, 2.5);
        ctx.fillRect(ex + 1.5, ey - 3, 2.5, 2.5);
      }

      // HP BAR ABOVE TOKEN
      const barWidth = isBoss ? 46 : 34;
      const barHeight = 4;
      const barX = ex - barWidth / 2;
      const barY = ey - radius - 9;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      ctx.fillStyle = isBoss ? '#dc2626' : '#ef4444';
      ctx.fillRect(barX, barY, Math.max(0, (enemy.hp / enemy.maxHp) * barWidth), barHeight);
      ctx.restore();
    });

    // 6. RENDER HERO TOKEN WITH GILDED CREST & CLASS MOTIF
    const px = player.x * TILE_SIZE + TILE_SIZE / 2;
    const py = player.y * TILE_SIZE + TILE_SIZE / 2;
    const pRadius = 19;

    ctx.save();
    // Drop Shadow
    ctx.beginPath();
    ctx.arc(px, py + 2, pRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fill();

    // Inspiration Glowing Aura
    if (player.conditions.includes('inspired')) {
      ctx.beginPath();
      ctx.arc(px, py, pRadius + 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Hero Token Outer Base
    ctx.beginPath();
    ctx.arc(px, py, pRadius, 0, Math.PI * 2);
    const heroGrad = ctx.createRadialGradient(px, py, 2, px, py, pRadius);
    if (player.hp <= 0) {
      heroGrad.addColorStop(0, '#450a0a');
      heroGrad.addColorStop(1, '#0f0202');
    } else if (player.classType === 'fighter') {
      heroGrad.addColorStop(0, '#7f1d1d');
      heroGrad.addColorStop(1, '#180404');
    } else if (player.classType === 'rogue') {
      heroGrad.addColorStop(0, '#064e3b');
      heroGrad.addColorStop(1, '#021f17');
    } else if (player.classType === 'wizard') {
      heroGrad.addColorStop(0, '#4c1d95');
      heroGrad.addColorStop(1, '#1e0c3a');
    } else {
      heroGrad.addColorStop(0, '#78350f');
      heroGrad.addColorStop(1, '#291203');
    }
    ctx.fillStyle = heroGrad;
    ctx.fill();

    // Gilded Outer Rim
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = player.hp <= 0 ? '#ef4444' : '#f59e0b';
    ctx.stroke();

    // Inner Ring Inset
    ctx.beginPath();
    ctx.arc(px, py, pRadius - 3, 0, Math.PI * 2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.35)';
    ctx.stroke();

    // Hero Class Iconography
    if (player.hp <= 0) {
      // Downed: Skull
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💀', px, py);
    } else if (player.classType === 'fighter') {
      // Golden Greatsword Motif
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px - 6, py + 6);
      ctx.lineTo(px + 6, py - 6);
      ctx.moveTo(px - 1, py - 1);
      ctx.lineTo(px - 5, py - 5);
      ctx.moveTo(px + 1, py + 1);
      ctx.lineTo(px - 3, py + 5);
      ctx.stroke();
    } else if (player.classType === 'rogue') {
      // Emerald Twin Daggers Motif
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px - 6, py - 6);
      ctx.lineTo(px + 6, py + 6);
      ctx.moveTo(px + 6, py - 6);
      ctx.lineTo(px - 6, py + 6);
      ctx.stroke();
    } else if (player.classType === 'wizard') {
      // Violet Arcane Starlight Rune
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, py - 8);
      ctx.lineTo(px, py + 8);
      ctx.moveTo(px - 8, py);
      ctx.lineTo(px + 8, py);
      ctx.stroke();
    } else {
      // Cleric: Radiant Solar Cross
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(px - 2, py - 7, 4, 14);
      ctx.fillRect(px - 6, py - 3, 12, 4);
    }
    ctx.restore();

    // 7. ATMOSPHERIC TORCHLIGHT VIGNETTE
    ctx.save();
    const lightRadius = 195;
    const lightGrad = ctx.createRadialGradient(px, py, 20, px, py, lightRadius);
    lightGrad.addColorStop(0, 'rgba(251, 191, 36, 0.08)');
    lightGrad.addColorStop(0.4, 'rgba(15, 23, 42, 0.05)');
    lightGrad.addColorStop(1, 'rgba(5, 7, 12, 0.72)');
    ctx.fillStyle = lightGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();

    if (hoveredTile && (movementCost !== undefined || movementInvalidReason)) {
      ctx.save();
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = movementInvalidReason ? '#f87171' : '#7dd3fc';
      ctx.fillText(
        movementInvalidReason ? movementInvalidReason : `Move cost: ${movementCost}`,
        hoveredTile.x * TILE_SIZE + 4,
        hoveredTile.y * TILE_SIZE + 14
      );
      ctx.restore();
    }

    // 8. RENDER FLOATING DAMAGE NUMBERS
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
    movementPath,
    movementCost,
    movementInvalidReason,
    onTileHover,
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
      onTileHover?.(x, y);
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
        tabIndex={0}
        role="application"
        aria-label={`Tactical map: ${room.name}. Tap or click a tile to move; select an enemy to attack.`}
        onKeyDown={(event) => { const moves: Record<string, Point> = { ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 } }; const move = moves[event.key]; if (move) { event.preventDefault(); onTileClick(player.x + move.x, player.y + move.y); } }}
        className="rounded-xl border border-[#23293d] shadow-2xl bg-[#080a10] cursor-crosshair max-w-full max-h-full object-contain"
      />
    </div>
  );
};
