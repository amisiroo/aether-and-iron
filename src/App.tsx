import { useState, useEffect, useCallback } from 'react';
import {
  Entity,
  Room,
  Skill,
  GamePhase,
  RollResult,
  ChronicleEntry,
  GameItem,
  RollMode,
} from './types/game';
import { CHAPTER_1_ROOMS } from './data/rooms';
import {
  rollD20,
  rollDamageString,
  evaluateCombatAdvantage,
  rollDeathSave,
  getAbilityModifier,
  checkInterveningCover,
} from './core/dnd';
import { CharacterCreation } from './components/CharacterCreation';
import { GameHUD } from './components/GameHUD';
import { DiceModal } from './components/DiceModal';
import { MinimapModal } from './components/MinimapModal';
import { CanvasGrid } from './renderer/CanvasGrid';
import { Trophy, RefreshCw } from 'lucide-react';
import { sound } from './utils/audio';

const SAVE_KEY = 'aether_and_iron_save_v1';

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
  lifetime: number;
}

export function App() {
  // Game Phase
  const [phase, setPhase] = useState<GamePhase>('creation');

  // Dungeon Rooms
  const [rooms, setRooms] = useState<Record<string, Room>>(CHAPTER_1_ROOMS);
  const [currentRoomId, setCurrentRoomId] = useState<string>('room_entrance');

  // Entities
  const [player, setPlayer] = useState<Entity | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  // Active Dice Modal
  const [activeRoll, setActiveRoll] = useState<RollResult | null>(null);

  // Floating text feedback (damage numbers, miss, heals)
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [hasSaveGame, setHasSaveGame] = useState<boolean>(false);
  const [isMinimapOpen, setIsMinimapOpen] = useState<boolean>(false);

  // Check saved game on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.player && parsed?.currentRoomId) {
          setHasSaveGame(true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Story Chronicle Log
  const [chronicle, setChronicle] = useState<ChronicleEntry[]>([
    {
      id: 'init_1',
      timestamp: '00:01',
      type: 'narrative',
      text: 'Ekspedisi dimulai. Pintu gerbang The Sunken Reliquary tertutup rapat di belakangmu.',
    },
  ]);

  const currentRoom = rooms[currentRoomId];

  // Helper to save state
  const saveState = useCallback(
    (hero: Entity, rId: string, rms: Record<string, Room>, ch: ChronicleEntry[]) => {
      try {
        localStorage.setItem(
          SAVE_KEY,
          JSON.stringify({
            player: hero,
            currentRoomId: rId,
            rooms: rms,
            chronicle: ch.slice(0, 30),
          })
        );
        setHasSaveGame(true);
      } catch {
        // ignore
      }
    },
    []
  );

  const handleLoadGame = () => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPlayer(parsed.player);
        setCurrentRoomId(parsed.currentRoomId);
        setRooms(parsed.rooms);
        setChronicle(parsed.chronicle);
        setPhase('exploration');
        sound.playHeal();
        addChronicle('narrative', '📂 Checkpoint petualangan berhasil dimuat dari arsip Guild.');
      }
    } catch (err) {
      console.warn('Failed to load save', err);
    }
  };

  // Helper to add chronicle entry
  const addChronicle = useCallback((type: ChronicleEntry['type'], text: string) => {
    const now = new Date();
    const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setChronicle((prev) => [
      {
        id: Math.random().toString(36).substring(7),
        timestamp: timeStr,
        type,
        text,
      },
      ...prev.slice(0, 50), // Keep last 50 entries
    ]);
  }, []);

  // Helper to spawn floating text on canvas
  const triggerFloatingText = useCallback((x: number, y: number, text: string, color: string) => {
    const TILE_SIZE = 48;
    const px = x * TILE_SIZE + TILE_SIZE / 2;
    const py = y * TILE_SIZE + 10;
    const newText: FloatingText = {
      id: Math.random().toString(36).substring(7),
      x: px,
      y: py,
      text,
      color,
      opacity: 1,
      lifetime: 30,
    };
    setFloatingTexts((prev) => [...prev, newText]);
  }, []);

  // Animate floating texts
  useEffect(() => {
    if (floatingTexts.length === 0) return;
    const interval = setInterval(() => {
      setFloatingTexts((prev) =>
        prev
          .map((ft) => ({
            ...ft,
            y: ft.y - 1.5,
            opacity: ft.opacity - 0.035,
            lifetime: ft.lifetime - 1,
          }))
          .filter((ft) => ft.lifetime > 0 && ft.opacity > 0)
      );
    }, 40);
    return () => clearInterval(interval);
  }, [floatingTexts.length]);

  // Handle Character Created
  const handleCharacterCreated = (createdHero: Entity) => {
    setPlayer(createdHero);
    setPhase('exploration');
    sound.playHeal();
    addChronicle(
      'narrative',
      `Petualang ${createdHero.name} (${createdHero.classType?.toUpperCase()}) tiba di ${currentRoom.name}. ${currentRoom.lore}`
    );
    saveState(createdHero, currentRoomId, rooms, chronicle);
  };

  // Check if room enters combat
  useEffect(() => {
    if (phase === 'creation' || phase === 'game_over' || phase === 'victory') return;
    const hasAliveEnemies = currentRoom.enemies.some((e) => e.hp > 0);
    if (hasAliveEnemies && phase !== 'combat') {
      setPhase('combat');
      addChronicle(
        'combat',
        `⚠️ ANCAMAN TERDETEKSI! Musuh di ${currentRoom.name} mengambil posisi siaga. Giliran taktis dimulai!`
      );
    } else if (!hasAliveEnemies && phase === 'combat') {
      setPhase('exploration');
      addChronicle(
        'narrative',
        `Ruangan telah aman. Suasana kembali hening. Kamu dapat menjelajah dengan bebas.`
      );
    }
  }, [currentRoom.enemies, phase, currentRoom.name, addChronicle]);

  // Check for Boss Defeat & Victory
  useEffect(() => {
    if (currentRoomId === 'room_sanctum') {
      const boss = currentRoom.enemies.find((e) => e.id === 'boss_iron_warden');
      if (boss && boss.hp <= 0 && phase !== 'victory') {
        setPhase('victory');
        sound.playVictory();
        addChronicle(
          'narrative',
          '🏆 THE IRON WARDEN TUMBANG! Batu relik purba The Obsidian Heart bersinar terang menanti untuk diambil!'
        );
      }
    }
  }, [currentRoom.enemies, currentRoomId, phase, addChronicle]);

  // --- PLAYER MOVEMENT & TILE INTERACTION ---
  const handleTileClick = (tx: number, ty: number) => {
    if (!player || player.hp <= 0) return;

    // Check bounds
    if (ty < 0 || ty >= currentRoom.layout.length || tx < 0 || tx >= currentRoom.layout[0].length) {
      return;
    }

    const char = currentRoom.layout[ty][tx];
    if (char === '#') return; // Cannot walk into walls

    // Check if tile is occupied by an alive enemy
    const enemyOnTile = currentRoom.enemies.find((e) => e.x === tx && e.y === ty && e.hp > 0);
    if (enemyOnTile) {
      // If clicked on enemy, trigger attack
      handleEnemyClick(enemyOnTile);
      return;
    }

    // Calculate movement cost
    const dist = Math.abs(player.x - tx) + Math.abs(player.y - ty);
    if (dist === 0) {
      if (selectedSkill && (selectedSkill.id === 'cure_wounds' || selectedSkill.range === 0)) {
        handleSelfCastSkill(selectedSkill);
      }
      return;
    }

    const isRubble = char === '~';
    const moveCost = isRubble ? dist * 2 : dist;

    // In combat, check movement point limit
    if (phase === 'combat') {
      if (moveCost > player.remainingSpeed) {
        addChronicle('combat', `Movement point tidak cukup (${moveCost} dibutuhkan, sisa ${player.remainingSpeed}).`);
        return;
      }
    }

    // Step to tile
    const newPlayer = {
      ...player,
      x: tx,
      y: ty,
      remainingSpeed: phase === 'combat' ? player.remainingSpeed - moveCost : player.speed,
    };

    // If stepped on Hazard Tile (Web / Spikes)
    if (char === '^') {
      const dexMod = getAbilityModifier(player.attributes.DEX);
      const saveRoll = rollD20(dexMod, 'normal', 12, 'DEX Save vs Web Hazard [DC 12]');
      setActiveRoll(saveRoll);

      if (!saveRoll.success) {
        newPlayer.conditions = [...newPlayer.conditions.filter((c) => c !== 'restrained'), 'restrained'];
        newPlayer.remainingSpeed = 0;
        triggerFloatingText(tx, ty, 'RESTRAINED!', '#c084fc');
        addChronicle(
          'hazard',
          `🕸️ Terjerat sarang laba-laba! Gagal DEX Save (${saveRoll.total} < 12). Kamu terkena status RESTRAINED (-Disadvantage on attacks)!`
        );
      } else {
        triggerFloatingText(tx, ty, 'SAVED!', '#10b981');
        addChronicle(
          'hazard',
          `Lolos dari jeratan sarang! DEX Save Sukses (${saveRoll.total} >= 12).`
        );
      }
    }

    // Check Door transition
    if (char === 'D' || char === 'S') {
      let nextRoomKey: string | undefined;
      if (ty === 1 && currentRoom.exits.north) nextRoomKey = currentRoom.exits.north;
      else if (ty >= currentRoom.height - 2 && currentRoom.exits.south) nextRoomKey = currentRoom.exits.south;
      else if (currentRoom.exits.north) nextRoomKey = currentRoom.exits.north;
      else if (currentRoom.exits.south) nextRoomKey = currentRoom.exits.south;

      if (nextRoomKey && rooms[nextRoomKey]) {
        transitionToRoom(nextRoomKey, newPlayer);
        return;
      }
    }

    setPlayer(newPlayer);
  };

  // --- TRANSITION BETWEEN ROOMS ---
  const transitionToRoom = (targetRoomId: string, updatedPlayer: Entity) => {
    const nextRoom = rooms[targetRoomId];
    if (!nextRoom) return;

    setCurrentRoomId(targetRoomId);
    setRooms((prev) => ({
      ...prev,
      [targetRoomId]: { ...prev[targetRoomId], visited: true },
    }));

    setPlayer({
      ...updatedPlayer,
      x: nextRoom.playerSpawn.x,
      y: nextRoom.playerSpawn.y,
      remainingSpeed: updatedPlayer.speed,
      hasUsedAction: false,
      hasUsedBonusAction: false,
    });

    addChronicle(
      'narrative',
      `Melangkah melewati pintu gerbang... Memasuki ${nextRoom.name}. ${nextRoom.lore}`
    );
  };

  // --- INTERACTABLE OBJECT CLICK ---
  const handleInteractableClick = (itemId: string) => {
    if (!player || player.hp <= 0) return;

    const item = currentRoom.interactables.find((i) => i.id === itemId);
    if (!item || item.resolved) return;

    // Check if item requires a D&D Stat check
    if (item.check) {
      const stat = item.check.stat;
      const mod = getAbilityModifier(player.attributes[stat]);
      const mode = player.conditions.includes('inspired') ? 'advantage' : 'normal';

      sound.playDiceRoll();
      const roll = rollD20(mod, mode, item.check.dc, `${item.name}: ${item.check.prompt}`);
      setActiveRoll(roll);

      // Consume inspiration if used
      let updatedConditions = [...player.conditions];
      if (mode === 'advantage') {
        updatedConditions = updatedConditions.filter((c) => c !== 'inspired');
      }

      if (roll.success) {
        sound.playCrit();
        addChronicle('check', `[SUCCESS DC ${item.check.dc}] ${item.onSuccess.message}`);
        let newHp = player.hp;
        if (item.onSuccess.effect === 'inspiration') {
          updatedConditions.push('inspired');
          triggerFloatingText(item.x, item.y, 'INSPIRED!', '#f59e0b');
        } else if (item.onSuccess.effect === 'heal') {
          newHp = player.maxHp;
          triggerFloatingText(item.x, item.y, 'MAX HEAL!', '#10b981');
        }
        setPlayer((p) => (p ? { ...p, hp: newHp, conditions: updatedConditions } : null));
      } else {
        sound.playMiss();
        addChronicle('check', `[FAILED DC ${item.check.dc}] ${item.onFailure.message}`);
        let newHp = player.hp;
        if (item.onFailure.effect === 'damage' && item.onFailure.damage) {
          const dmg = item.onFailure.damage;
          newHp = Math.max(0, player.hp - dmg);
          triggerFloatingText(player.x, player.y, `-${dmg} HP`, '#ef4444');
          if (newHp <= 0) sound.playDefeat();
        }
        setPlayer((p) => (p ? { ...p, hp: newHp, conditions: updatedConditions } : null));
      }
    } else {
      // Direct success without check (e.g. Relic pedestal)
      sound.playVictory();
      addChronicle('narrative', item.onSuccess.message);
      if (item.id === 'relic_pedestal') {
        setPhase('victory');
      }
    }

    // Mark item resolved
    setRooms((prev) => ({
      ...prev,
      [currentRoomId]: {
        ...prev[currentRoomId],
        interactables: prev[currentRoomId].interactables.map((i) =>
          i.id === itemId ? { ...i, resolved: true } : i
        ),
      },
    }));
  };

  // --- SELF-CAST SKILL HANDLER ---
  const handleSelfCastSkill = (skill: Skill) => {
    if (!player || player.hp <= 0) return;

    if (phase === 'combat') {
      if (skill.costType === 'action' && player.hasUsedAction) {
        addChronicle('combat', 'Kamu sudah menggunakan Action di turn ini.');
        return;
      }
      if (skill.costType === 'bonus_action' && player.hasUsedBonusAction) {
        addChronicle('combat', 'Kamu sudah menggunakan Bonus Action di turn ini.');
        return;
      }
    }

    let updatedPlayer = { ...player };

    if (skill.id === 'second_wind') {
      const healResult = rollDamageString('1d10+1', 0, false);
      const healedHp = Math.min(player.maxHp, player.hp + healResult.total);
      const actualGain = healedHp - player.hp;
      updatedPlayer.hp = healedHp;
      if (skill.costType === 'bonus_action') updatedPlayer.hasUsedBonusAction = true;
      sound.playHeal();
      triggerFloatingText(player.x, player.y, `+${actualGain} HP!`, '#10b981');
      addChronicle(
        'combat',
        `💨 SECOND WIND! Menghirup nafas tempur dan memulihkan +${actualGain} HP (Sekarang: ${healedHp}/${player.maxHp} HP).`
      );
    } else if (skill.id === 'cunning_stride') {
      updatedPlayer.remainingSpeed += 3;
      if (skill.costType === 'bonus_action') updatedPlayer.hasUsedBonusAction = true;
      sound.playHeal();
      triggerFloatingText(player.x, player.y, `+3 SPEED!`, '#38bdf8');
      addChronicle('combat', `⚡ CUNNING DASH! Manuver cepat menambah +3 Movement Points.`);
    } else if (skill.id === 'cure_wounds') {
      const wisMod = getAbilityModifier(player.attributes.WIS);
      const healResult = rollDamageString('1d8', wisMod, false);
      const healedHp = Math.min(player.maxHp, player.hp + healResult.total);
      const actualGain = healedHp - player.hp;
      updatedPlayer.hp = healedHp;
      if (skill.costType === 'action') updatedPlayer.hasUsedAction = true;
      sound.playHeal();
      triggerFloatingText(player.x, player.y, `+${actualGain} HP!`, '#10b981');
      addChronicle(
        'combat',
        `✨ CURE WOUNDS! Cahaya mukjizat memulihkan +${actualGain} HP (Sekarang: ${healedHp}/${player.maxHp} HP).`
      );
    }

    setPlayer(updatedPlayer);
    setSelectedSkill(null);
  };

  const handleSelectSkill = (skill: Skill | null) => {
    if (!skill) {
      setSelectedSkill(null);
      return;
    }
    if (skill.range === 0 && player) {
      handleSelfCastSkill(skill);
      return;
    }
    setSelectedSkill(skill);
  };

  // --- INVENTORY ITEM HANDLER ---
  const handleUseItem = (item: GameItem) => {
    if (!player || player.hp <= 0 || item.count <= 0) return;

    if (phase === 'combat' && player.hasUsedBonusAction) {
      addChronicle('combat', 'Kamu sudah menggunakan Bonus Action di turn ini untuk item/skill.');
      return;
    }

    const updatedInventory = player.inventory
      ?.map((inv) => (inv.id === item.id ? { ...inv, count: inv.count - 1 } : inv))
      .filter((inv) => inv.count > 0);

    let updatedConditions = [...player.conditions];
    let newHp = player.hp;

    if (item.effect === 'heal') {
      const healRoll = rollDamageString('2d4+2');
      newHp = Math.min(player.maxHp, player.hp + healRoll.total);
      const gain = newHp - player.hp;
      sound.playHeal();
      triggerFloatingText(player.x, player.y, `+${gain} HP!`, '#10b981');
      addChronicle(
        'combat',
        `🧪 Menggunakan ${item.name}! Meminum ramuan dan memulihkan +${gain} HP (Sekarang: ${newHp}/${player.maxHp} HP).`
      );
    } else if (item.effect === 'inspiration') {
      if (!updatedConditions.includes('inspired')) {
        updatedConditions.push('inspired');
      }
      sound.playHeal();
      triggerFloatingText(player.x, player.y, 'INSPIRED!', '#f59e0b');
      addChronicle(
        'combat',
        `📜 Menggunakan ${item.name}! Aura berkah memicu status GUILD INSPIRATION (+Advantage pada roll berikutnya)!`
      );
    }

    setPlayer({
      ...player,
      hp: newHp,
      conditions: updatedConditions,
      inventory: updatedInventory,
      hasUsedBonusAction: phase === 'combat' ? true : player.hasUsedBonusAction,
    });
  };

  // --- ATTACK ENEMY RESOLUTION ---
  const handleEnemyClick = (enemy: Entity) => {
    if (!player || player.hp <= 0) return;

    if (phase === 'combat' && player.hasUsedAction) {
      addChronicle('combat', 'Kamu sudah menggunakan Action di turn ini. Tekan "End Turn" untuk giliran musuh.');
      return;
    }

    const activeSkill = selectedSkill || player.skills[0]; // default to first skill
    const dist = Math.max(Math.abs(player.x - enemy.x), Math.abs(player.y - enemy.y));

    if (dist > activeSkill.range) {
      addChronicle('combat', `Musuh berada di luar jangkauan ${activeSkill.name} (Jarak: ${dist}, Jangkauan: ${activeSkill.range} tile).`);
      return;
    }

    // Evaluate Advantage / Disadvantage
    const isAdjacent = Math.max(Math.abs(player.x - enemy.x), Math.abs(player.y - enemy.y)) === 1;
    const playerTileChar = currentRoom.layout[player.y]?.[player.x];
    const playerTile = {
      x: player.x,
      y: player.y,
      type: playerTileChar === '~' ? ('rubble' as const) : ('floor' as const),
      visible: true,
      explored: true,
    };

    // True Line-of-sight Cover check via Bresenham algorithm
    const hasCoverBetween = checkInterveningCover(
      player.x,
      player.y,
      enemy.x,
      enemy.y,
      currentRoom.layout
    );

    const evalResult = evaluateCombatAdvantage(
      player,
      enemy,
      activeSkill.range,
      playerTile,
      isAdjacent,
      hasCoverBetween
    );

    const statMod = getAbilityModifier(player.attributes[activeSkill.stat]);

    // Check for Magic Missile (Auto-hit)
    let roll: RollResult;
    if (activeSkill.id === 'magic_missile') {
      sound.playHit();
      roll = {
        d1: 20,
        chosen: 20,
        modifier: statMod,
        total: 20,
        mode: 'normal',
        isCrit: false,
        isFumble: false,
        targetValue: enemy.ac,
        success: true,
        reason: 'Magic Missile (Auto-Hit Force Darts!)',
      };
    } else {
      sound.playDiceRoll();
      roll = rollD20(
        statMod,
        evalResult.mode,
        enemy.ac,
        `${activeSkill.name} vs AC ${enemy.ac} (${evalResult.reasons.join(', ')})`
      );
    }

    setActiveRoll(roll);

    // Consume Inspiration if present
    let updatedConditions = player.conditions.filter((c) => c !== 'inspired');

    // Action economy flag
    let updatedPlayer = {
      ...player,
      conditions: updatedConditions,
      hasUsedAction: activeSkill.costType === 'action' ? true : player.hasUsedAction,
      hasUsedBonusAction: activeSkill.costType === 'bonus_action' ? true : player.hasUsedBonusAction,
    };

    if (roll.success) {
      if (roll.isCrit) sound.playCrit();
      else sound.playHit();
      // Calculate damage
      const dmgFormula = activeSkill.damageDice || '1d8';
      const dmgResult = rollDamageString(dmgFormula, statMod, roll.isCrit);
      let totalDamage = dmgResult.total;

      // Rogue Sneak Attack bonus if advantage was active
      if (player.classType === 'rogue' && evalResult.mode === 'advantage') {
        const sneakBonus = rollDamageString('1d6').total;
        totalDamage += sneakBonus;
        addChronicle('combat', `🗡️ SNEAK ATTACK TERPICU! (+${sneakBonus} ekstra damage).`);
      }

      const updatedHp = Math.max(0, enemy.hp - totalDamage);
      triggerFloatingText(enemy.x, enemy.y, `-${totalDamage} DMG`, '#ef4444');

      addChronicle(
        'combat',
        `🎯 HIT! ${player.name} menggunakan ${activeSkill.name}: Total ${roll.total} vs AC ${enemy.ac}. Menghasilkan ${totalDamage} damage (${dmgResult.details}).`
      );

      if (updatedHp <= 0) {
        addChronicle('combat', `💀 ${enemy.name} berhasil dikalahkan!`);
      }

      // Update enemy HP in room
      setRooms((prev) => ({
        ...prev,
        [currentRoomId]: {
          ...prev[currentRoomId],
          enemies: prev[currentRoomId].enemies.map((e) =>
            e.id === enemy.id ? { ...e, hp: updatedHp } : e
          ),
        },
      }));
    } else {
      sound.playMiss();
      triggerFloatingText(enemy.x, enemy.y, 'MISS!', '#94a3b8');
      addChronicle(
        'combat',
        `❌ MISS! Serangan ${activeSkill.name} meleset (Total ${roll.total} vs AC ${enemy.ac}).`
      );
    }

    setPlayer(updatedPlayer);
  };

  // --- ENEMY AI TURN RESOLUTION ---
  const handleEndTurn = () => {
    if (!player) return;

    addChronicle('combat', '--- GILIRAN MUSUH (ENEMY TURN) ---');

    // Iterate through alive enemies
    const aliveEnemies = currentRoom.enemies.filter((e) => e.hp > 0);
    let currentPlayer = { ...player };

    const updatedEnemies = aliveEnemies.map((enemy) => {
      let ex = enemy.x;
      let ey = enemy.y;

      // Distance to player
      const dist = Math.max(Math.abs(ex - currentPlayer.x), Math.abs(ey - currentPlayer.y));
      const attackRange = enemy.skills[0]?.range || 1;

      // 1. Move closer if out of range
      if (dist > attackRange) {
        const dx = Math.sign(currentPlayer.x - ex);
        const dy = Math.sign(currentPlayer.y - ey);

        // Simple step
        const nextX = ex + dx;
        const nextY = ey + dy;
        const tileChar = currentRoom.layout[nextY]?.[nextX];
        if (tileChar !== '#' && (nextX !== currentPlayer.x || nextY !== currentPlayer.y)) {
          ex = nextX;
          ey = nextY;
        }
      }

      // 2. Attack player if in range
      const newDist = Math.max(Math.abs(ex - currentPlayer.x), Math.abs(ey - currentPlayer.y));
      if (newDist <= attackRange) {
        const isPlayerDowned = currentPlayer.hp <= 0 || currentPlayer.conditions.includes('downed');

        // Line of sight cover check
        const enemyHasCover = checkInterveningCover(
          ex,
          ey,
          currentPlayer.x,
          currentPlayer.y,
          currentRoom.layout
        );

        // Merciless AI rule + Cover check:
        // If player is downed, enemy attacks with Advantage!
        // If player is behind rubble/cover from ranged attack, Disadvantage!
        let mode: RollMode = isPlayerDowned ? 'advantage' : 'normal';
        if (enemyHasCover && attackRange > 1) {
          mode = mode === 'advantage' ? 'normal' : 'disadvantage';
        }

        const strMod = getAbilityModifier(enemy.attributes.STR);
        const enemyRoll = rollD20(
          strMod,
          mode,
          currentPlayer.ac,
          `${enemy.name} attacks ${currentPlayer.name} ${
            isPlayerDowned
              ? '[MERCILESS STRIKE]'
              : enemyHasCover && attackRange > 1
              ? '[COVER DISADVANTAGE]'
              : ''
          }`
        );

        if (enemyRoll.success) {
          sound.playHit();
          if (isPlayerDowned) {
            // MERCILESS HIT: Inflicts 2 Death Save failures directly!
            const newFailures = currentPlayer.deathSaves.failures + 2;
            const isDead = newFailures >= 3;
            currentPlayer.deathSaves = {
              ...currentPlayer.deathSaves,
              failures: newFailures,
              dead: isDead,
            };

            triggerFloatingText(currentPlayer.x, currentPlayer.y, '+2 DEATH FAILS!', '#ef4444');
            addChronicle(
              'death_save',
              `💀 MERCILESS STRIKE! ${enemy.name} menghujam petualang yang tak berdaya! +2 KEGAGALAN DEATH SAVE LANGSUNG! [${newFailures}/3]`
            );

            if (isDead) {
              sound.playDefeat();
              setPhase('game_over');
            }
          } else {
            // Normal hit to alive player
            const enemyDmg = rollDamageString(enemy.skills[0]?.damageDice || '1d6', strMod, enemyRoll.isCrit);
            const newHp = Math.max(0, currentPlayer.hp - enemyDmg.total);
            currentPlayer.hp = newHp;
            triggerFloatingText(currentPlayer.x, currentPlayer.y, `-${enemyDmg.total} HP`, '#ef4444');

            addChronicle(
              'combat',
              `💥 ${enemy.name} MENYERANG! Mengenai ${currentPlayer.name} sebesar ${enemyDmg.total} damage (${enemyDmg.details}).`
            );

            if (newHp <= 0) {
              sound.playDefeat();
              currentPlayer.conditions = [...currentPlayer.conditions.filter((c) => c !== 'downed'), 'downed'];
              addChronicle(
                'death_save',
                '⚠️ HP MENCAPAI 0! Petualang tersungkur (DOWNED). Waktunya melempar Death Saving Throw!'
              );
            }
          }
        } else {
          sound.playMiss();
          triggerFloatingText(currentPlayer.x, currentPlayer.y, 'DODGED!', '#38bdf8');
          addChronicle(
            'combat',
            `🛡️ ${currentPlayer.name} berhasil menangkis serangan ${enemy.name}!`
          );
        }
      }

      return { ...enemy, x: ex, y: ey };
    });

    // Update enemies in room
    setRooms((prev) => ({
      ...prev,
      [currentRoomId]: {
        ...prev[currentRoomId],
        enemies: prev[currentRoomId].enemies.map((e) => {
          const updated = updatedEnemies.find((ue) => ue.id === e.id);
          return updated || e;
        }),
      },
    }));

    // Reset player action economy for the new round
    setPlayer({
      ...currentPlayer,
      remainingSpeed: currentPlayer.speed,
      hasUsedAction: false,
      hasUsedBonusAction: false,
    });

    addChronicle('combat', '--- GILIRAN PETUALANG (YOUR TURN) ---');
  };

  // Keyboard navigation (WASD / Arrows / Space / 1-4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!player || player.hp <= 0 || phase === 'creation' || phase === 'game_over' || phase === 'victory') return;
      if (activeRoll) return;

      let dx = 0;
      let dy = 0;
      if (e.key === 'w' || e.key === 'ArrowUp' || e.key === 'W') dy = -1;
      else if (e.key === 's' || e.key === 'ArrowDown' || e.key === 'S') dy = 1;
      else if (e.key === 'a' || e.key === 'ArrowLeft' || e.key === 'A') dx = -1;
      else if (e.key === 'd' || e.key === 'ArrowRight' || e.key === 'D') dx = 1;
      else if (e.key === ' ' && phase === 'combat') {
        e.preventDefault();
        handleEndTurn();
        return;
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (player.skills[idx]) {
          setSelectedSkill((prev) => (prev?.id === player.skills[idx].id ? null : player.skills[idx]));
        }
        return;
      }

      if (dx !== 0 || dy !== 0) {
        handleTileClick(player.x + dx, player.y + dy);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, phase, activeRoll, currentRoom, handleEndTurn, handleTileClick]);

  // --- DEATH SAVING THROW ROLL ---
  const handleRollDeathSave = () => {
    if (!player) return;

    sound.playDiceRoll();
    const result = rollDeathSave(player.deathSaves);
    setActiveRoll({
      d1: result.roll,
      chosen: result.roll,
      modifier: 0,
      total: result.roll,
      mode: 'normal',
      isCrit: result.roll === 20,
      isFumble: result.roll === 1,
      targetValue: 10,
      success: result.roll >= 10,
      reason: 'D&D 5e Death Saving Throw (1d20 pure)',
    });

    if (result.revivedWithHp) {
      sound.playCrit();
      setPlayer({
        ...player,
        hp: result.revivedWithHp,
        conditions: player.conditions.filter((c) => c !== 'downed'),
        deathSaves: { successes: 0, failures: 0, stabilized: false, dead: false },
      });
      triggerFloatingText(player.x, player.y, 'REVIVED (1 HP)!', '#10b981');
      addChronicle('death_save', result.message);
    } else if (result.updated.dead) {
      sound.playDefeat();
      setPlayer({ ...player, deathSaves: result.updated });
      setPhase('game_over');
      addChronicle('death_save', '💀 3 KEGAGALAN TERCAPAI. Nyawamu terenggut di dalam reruntuhan kuno. GAME OVER.');
    } else if (result.updated.stabilized) {
      sound.playHeal();
      setPlayer({ ...player, deathSaves: result.updated });
      addChronicle('death_save', '🛡️ STABILIZED! Petualang berhasil menstabilkan diri.');
    } else {
      if (result.roll >= 10) sound.playHeal();
      else sound.playMiss();
      setPlayer({ ...player, deathSaves: result.updated });
      addChronicle('death_save', result.message);
    }
  };

  const handleRestart = () => {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {}
    setHasSaveGame(false);
    setRooms(CHAPTER_1_ROOMS);
    setCurrentRoomId('room_entrance');
    setPlayer(null);
    setPhase('creation');
    setSelectedSkill(null);
    setActiveRoll(null);
  };

  return (
    <div className="w-full h-screen bg-[#08090c] text-white overflow-x-hidden overflow-y-auto">
      {/* 1. CHARACTER CREATION SCREEN */}
      {phase === 'creation' && (
        <CharacterCreation
          onCharacterCreated={handleCharacterCreated}
          hasSave={hasSaveGame}
          onLoadGame={handleLoadGame}
        />
      )}

      {/* 2. GAMEPLAY HUD & CANVAS */}
      {player && (phase === 'exploration' || phase === 'combat') && (
        <>
          <GameHUD
            player={player}
            currentRoom={currentRoom}
            phase={phase}
            selectedSkill={selectedSkill}
            chronicle={chronicle}
            onSelectSkill={handleSelectSkill}
            onOpenMinimap={() => setIsMinimapOpen(true)}
            onUseItem={handleUseItem}
            onEndTurn={handleEndTurn}
            onRollDeathSave={handleRollDeathSave}
            onRestart={handleRestart}
          />

          {/* Canvas Mount into DOM */}
          <div className="hidden">
            {/* Kept here or injected */}
          </div>
        </>
      )}

      {/* Render Canvas within the #canvas-container */}
      {player && (phase === 'exploration' || phase === 'combat') && (
        <div className="fixed top-14 left-0 right-0 lg:right-96 bottom-20 flex items-center justify-center pointer-events-auto z-10">
          <CanvasGrid
            room={currentRoom}
            player={player}
            enemies={currentRoom.enemies}
            selectedSkill={selectedSkill}
            floatingTexts={floatingTexts}
            onTileClick={handleTileClick}
            onEnemyClick={handleEnemyClick}
            onInteractableClick={handleInteractableClick}
          />
        </div>
      )}

      {/* 3. DICE RESOLUTION MODAL */}
      {activeRoll && (
        <DiceModal roll={activeRoll} onClose={() => setActiveRoll(null)} />
      )}

      {/* MINIMAP MODAL */}
      {isMinimapOpen && (
        <MinimapModal
          rooms={rooms}
          currentRoomId={currentRoomId}
          onClose={() => setIsMinimapOpen(false)}
        />
      )}

      {/* 4. GAME OVER SCREEN */}
      {phase === 'game_over' && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="p-4 rounded-full bg-red-950/60 border border-red-500/40 mb-4">
            <span className="text-5xl">💀</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-red-500 font-cinzel mb-2">
            QUEST FAILED — PERMA-DEATH
          </h1>
          <p className="text-gray-400 max-w-md text-sm mb-6 leading-relaxed">
            Petualangmu gugur di kedalaman <i>The Sunken Reliquary</i>. Musuh tanpa ampun (Merciless) mengakhiri riwayatmu sebelum relic berhasil diselamatkan.
          </p>
          <button
            onClick={handleRestart}
            className="px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold font-mono tracking-wider flex items-center gap-2 shadow-xl shadow-red-950/50 transition"
          >
            <RefreshCw className="w-4 h-4" /> CREATE NEW DELVER & RETRY
          </button>
        </div>
      )}

      {/* 5. VICTORY SCREEN */}
      {phase === 'victory' && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="p-4 rounded-full bg-amber-950/60 border border-amber-500/40 mb-4">
            <Trophy className="w-16 h-16 text-amber-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 font-cinzel mb-2">
            RELIC SECURED — QUEST COMPLETE!
          </h1>
          <p className="text-gray-300 max-w-lg text-sm mb-4 leading-relaxed">
            Selamat! Kamu telah mengalahkan <b>The Iron Warden</b> dan mengekstrak <b>The Obsidian Heart</b>! Laporan telah dikirimkan ke Adventurer's Guild Headquarter.
          </p>
          <div className="p-4 rounded-xl bg-[#121520] border border-amber-500/30 text-amber-300 font-mono text-xs mb-8 space-y-1">
            <div>🏅 <b>Rank Promoted:</b> Bronze Delver ➔ <b>Silver Delver</b></div>
            <div>💰 <b>Guild Bounty Reward:</b> 500 Gold Coins</div>
            <div>📜 <b>Archive Status:</b> Chapter 1 Relic Logged</div>
          </div>
          <button
            onClick={handleRestart}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-gray-950 font-black font-cinzel tracking-wider flex items-center gap-2 shadow-xl transition"
          >
            <RefreshCw className="w-4 h-4" /> PLAY AGAIN WITH DIFFERENT CLASS
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
