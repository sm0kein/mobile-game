import { CREDIT_PACKS, getHero, HEROES, HEROES_PER_PACK, HERO_PACK_COST, STARTER_HERO_IDS } from "./data";
import type {
  BattleLogEntry,
  BattleState,
  BattleStats,
  BattleUnit,
  BoardPos,
  CreditPack,
  GameState,
  HeroInstance,
  Rarity,
  TerrainType
} from "./types";

const STORAGE_KEY = "astral-tactics-prototype-state-v1";
const BOARD_WIDTH = 6;
const BOARD_HEIGHT = 8;
const TERRAIN: TerrainType[][] = [
  ["wall", "plain", "road", "road", "plain", "wall"],
  ["plain", "ward", "plain", "plain", "forest", "plain"],
  ["plain", "plain", "road", "road", "plain", "plain"],
  ["water", "plain", "plain", "plain", "plain", "water"],
  ["water", "plain", "plain", "plain", "plain", "water"],
  ["plain", "plain", "road", "road", "plain", "plain"],
  ["plain", "forest", "plain", "plain", "ward", "plain"],
  ["wall", "plain", "road", "road", "plain", "wall"]
];

export type GameService = {
  loadState: () => GameState;
  claimCreditPack: (state: GameState, packId: string) => GameState;
  openHeroPack: (state: GameState) => { state: GameState; heroes: HeroInstance[] };
  startBattle: (state: GameState) => BattleState;
  moveUnit: (battle: BattleState, uid: string, pos: BoardPos) => BattleState;
  attackUnit: (battle: BattleState, attackerUid: string, defenderUid: string) => BattleState;
  waitUnit: (battle: BattleState, uid: string) => BattleState;
  runCpuPhase: (battle: BattleState) => BattleState;
  resetProgress: () => GameState;
};

export const localGameService: GameService = {
  loadState,
  claimCreditPack,
  openHeroPack,
  startBattle,
  moveUnit,
  attackUnit,
  waitUnit,
  runCpuPhase,
  resetProgress
};

export function getCreditPacks(): CreditPack[] {
  return CREDIT_PACKS;
}

function loadState(): GameState {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored) as GameState;
  }

  return saveState({
    credits: 40,
    roster: STARTER_HERO_IDS.map((heroId) => createHeroInstance(heroId, heroId === "hero_bronn_keel" ? 3 : 4)),
    ledger: [
      {
        id: crypto.randomUUID(),
        type: "grant",
        amount: 40,
        reason: "Starter credits",
        createdAt: new Date().toISOString()
      }
    ],
    summonHistory: []
  });
}

function resetProgress(): GameState {
  localStorage.removeItem(STORAGE_KEY);
  return loadState();
}

function claimCreditPack(state: GameState, packId: string): GameState {
  const pack = CREDIT_PACKS.find((item) => item.id === packId);
  if (!pack) {
    return state;
  }

  return saveState({
    ...state,
    credits: state.credits + pack.credits,
    ledger: [
      {
        id: crypto.randomUUID(),
        type: "grant",
        amount: pack.credits,
        reason: `${pack.name} claimed`,
        createdAt: new Date().toISOString()
      },
      ...state.ledger
    ]
  });
}

function openHeroPack(state: GameState) {
  if (state.credits < HERO_PACK_COST) {
    return { state, heroes: [] };
  }

  const heroes = Array.from({ length: HEROES_PER_PACK }, () => summonHero());
  const nextState = saveState({
    ...state,
    credits: state.credits - HERO_PACK_COST,
    roster: [...heroes, ...state.roster],
    summonHistory: [heroes, ...state.summonHistory].slice(0, 10),
    ledger: [
      {
        id: crypto.randomUUID(),
        type: "spend",
        amount: HERO_PACK_COST,
        reason: "Opened 5-hero pack",
        createdAt: new Date().toISOString()
      },
      ...state.ledger
    ]
  });

  return { state: nextState, heroes };
}

function startBattle(state: GameState): BattleState {
  const playerRoster = state.roster.slice(0, 4);
  const playerUnits = playerRoster.map<BattleUnit>((instance, index) => {
    const hero = getHero(instance.heroId);
    const maxHp = scaledHp(hero.stats.hp, instance.rarity);
    return {
      uid: `p-${instance.instanceId}`,
      side: "player",
      hero,
      rarity: instance.rarity,
      hp: maxHp,
      maxHp,
      pos: { x: 1 + index, y: index % 2 === 0 ? 6 : 7 },
      acted: false,
      moved: false
    };
  });

  const enemyIds = ["hero_toma_brask", "hero_edda_rune", "hero_iri_quill", "hero_cass_rook"];
  const cpuUnits = enemyIds.map<BattleUnit>((heroId, index) => {
    const hero = getHero(heroId);
    const rarity = hero.rarityAvailability[0];
    const maxHp = Math.max(18, Math.floor(scaledHp(hero.stats.hp, rarity) * 0.85));
    return {
      uid: `c-${heroId}-${index}`,
      side: "cpu",
      hero,
      rarity,
      hp: maxHp,
      maxHp,
      pos: { x: 1 + index, y: index % 2 === 0 ? 1 : 0 },
      acted: false,
      moved: false
    };
  });

  return {
    phase: "player",
    turn: 1,
    units: [...playerUnits, ...cpuUnits],
    selectedUid: playerUnits[0]?.uid ?? null,
    status: "active",
    animation: null,
    log: [
      {
        id: crypto.randomUUID(),
        text: "Arena trial started. Defeat the CPU team.",
        tone: "info"
      }
    ]
  };
}

function moveUnit(battle: BattleState, uid: string, pos: BoardPos): BattleState {
  const unit = battle.units.find((item) => item.uid === uid);
  if (!unit || unit.acted || unit.side !== battle.phase || battle.status !== "active") {
    return battle;
  }
  if (!isInsideBoard(pos) || isBlocked(pos) || isOccupied(battle, pos) || distance(unit.pos, pos) > moveDistance(unit)) {
    return battle;
  }

  return {
    ...battle,
    animation: null,
    selectedUid: uid,
    units: battle.units.map((item) => (item.uid === uid ? { ...item, pos, moved: true } : item))
  };
}

function attackUnit(battle: BattleState, attackerUid: string, defenderUid: string): BattleState {
  const attacker = battle.units.find((item) => item.uid === attackerUid);
  const defender = battle.units.find((item) => item.uid === defenderUid);
  if (!attacker || !defender || attacker.acted || attacker.side !== battle.phase || attacker.side === defender.side) {
    return battle;
  }
  if (distance(attacker.pos, defender.pos) > attackRange(attacker)) {
    return battle;
  }

  const damage = calculateDamage(attacker, defender);
  const nextHp = Math.max(0, defender.hp - damage);
  const ko = nextHp === 0;
  let nextUnits = battle.units
    .map((item) => {
      if (item.uid === defenderUid) return { ...item, hp: nextHp };
      if (item.uid === attackerUid) return { ...item, acted: true, moved: true };
      return item;
    })
    .filter((item) => item.hp > 0);

  let log = addLog(battle.log, `${attacker.hero.name} hits ${defender.hero.name} for ${damage}.`, ko ? "ko" : "hit");
  if (ko) {
    log = addLog(log, `${defender.hero.name} is defeated.`, "ko");
  }

  const status = getBattleStatus(nextUnits);
  if (status === "victory") {
    log = addLog(log, "Victory! The CPU team has fallen.", "reward");
  }
  if (status === "defeat") {
    log = addLog(log, "Defeat. Your squad was routed.", "ko");
  }

  return {
    ...battle,
    animation: {
      id: crypto.randomUUID(),
      type: "attack",
      attackerUid,
      defenderUid,
      attackerSide: attacker.side,
      defenderSide: defender.side,
      attackerHero: attacker.hero,
      defenderHero: defender.hero,
      attackerFrom: attacker.pos,
      defenderFrom: defender.pos,
      damage,
      ko
    },
    units: nextUnits,
    selectedUid: nextUnits.some(u => u.uid === battle.selectedUid) ? battle.selectedUid : nextUnits.find((item) => item.side === battle.phase && !item.acted)?.uid ?? null,
    log,
    status
  };
}

function waitUnit(battle: BattleState, uid: string): BattleState {
  const unit = battle.units.find((item) => item.uid === uid);
  if (!unit || unit.acted || unit.side !== battle.phase || battle.status !== "active") {
    return battle;
  }
  return {
    ...battle,
    animation: null,
    units: battle.units.map((item) => (item.uid === uid ? { ...item, acted: true, moved: true } : item)),
    selectedUid: battle.units.some(u => u.uid === battle.selectedUid) ? battle.selectedUid : battle.units.find((item) => item.side === battle.phase && !item.acted && item.uid !== uid)?.uid ?? null,
    log: addLog(battle.log, `${unit.hero.name} waits.`, "info")
  };
}

function runCpuPhase(battle: BattleState): BattleState {
  if (battle.status !== "active") return battle;
  let nextBattle: BattleState = {
    ...battle,
    phase: "cpu",
    selectedUid: null,
    animation: null,
    units: battle.units.map((item) => ({ ...item, acted: false, moved: false })),
    log: addLog(battle.log, "CPU turn begins.", "info")
  };

  const cpu = chooseCpuUnit(nextBattle);
  if (cpu) {
    const target = findNearestEnemy(nextBattle, cpu);
    if (target && distance(cpu.pos, target.pos) > attackRange(cpu)) {
      nextBattle = moveCpuToward(nextBattle, cpu, target.pos);
    }

    const movedCpu = nextBattle.units.find((item) => item.uid === cpu.uid);
    const currentTarget = movedCpu ? findNearestEnemy(nextBattle, movedCpu) : null;
    if (movedCpu && currentTarget && distance(movedCpu.pos, currentTarget.pos) <= attackRange(movedCpu)) {
      nextBattle = attackUnit(nextBattle, movedCpu.uid, currentTarget.uid);
    } else if (movedCpu) {
      nextBattle = waitUnit(nextBattle, movedCpu.uid);
    }
  }

  if (nextBattle.status !== "active") {
    return nextBattle;
  }

  return {
    ...nextBattle,
    phase: "player",
    turn: nextBattle.turn + 1,
    selectedUid: battle.selectedUid && nextBattle.units.some(u => u.uid === battle.selectedUid) 
      ? battle.selectedUid 
      : nextBattle.units.find((item) => item.side === "player")?.uid ?? null,
    units: nextBattle.units.map((item) => ({ ...item, acted: false, moved: false })),
    log: addLog(nextBattle.log, `Turn ${nextBattle.turn + 1}: player turn.`, "info")
  };
}

export function moveDistance(unit: BattleUnit) {
  if (unit.hero.moveType === "Cavalry") return 3;
  if (unit.hero.moveType === "Armored") return 1;
  return 2;
}

export function attackRange(unit: BattleUnit) {
  return unit.hero.rangeType === "Melee" ? 1 : 2;
}

export function distance(a: BoardPos, b: BoardPos) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function getBoardSize() {
  return { width: BOARD_WIDTH, height: BOARD_HEIGHT };
}

export function getTerrainAt(pos: BoardPos): TerrainType {
  return TERRAIN[pos.y]?.[pos.x] ?? "plain";
}

export function getBattleStats(unit: BattleUnit): BattleStats {
  const rarityBonus = unit.rarity - 3;
  return {
    hp: unit.maxHp,
    atk: unit.hero.stats.atk + unit.rarity * 2,
    spd: unit.hero.stats.spd + rarityBonus,
    def: unit.hero.stats.def + rarityBonus,
    res: unit.hero.stats.res + rarityBonus
  };
}

function summonHero(): HeroInstance {
  const rarity = rollRarity();
  const pool = HEROES.filter((hero) => hero.rarityAvailability.includes(rarity));
  const hero = pool[Math.floor(Math.random() * pool.length)] ?? HEROES[0];
  return createHeroInstance(hero.id, rarity);
}

function rollRarity(): Rarity {
  const roll = Math.random();
  if (roll < 0.06) return 5;
  if (roll < 0.64) return 4;
  return 3;
}

function createHeroInstance(heroId: string, rarity: Rarity): HeroInstance {
  return {
    instanceId: crypto.randomUUID(),
    heroId,
    rarity,
    level: 1,
    merges: 0,
    obtainedAt: new Date().toISOString()
  };
}

function scaledHp(baseHp: number, rarity: Rarity) {
  return baseHp + (rarity - 3) * 3;
}

function calculateDamage(attacker: BattleUnit, defender: BattleUnit) {
  const attackerStats = getBattleStats(attacker);
  const defenderStats = getBattleStats(defender);
  const attack = attackerStats.atk;
  const defense = attacker.hero.damageType === "Physical" ? defenderStats.def : defenderStats.res;
  const triangle = triangleMultiplier(attacker.hero.element, defender.hero.element);
  const speedBonus = attackerStats.spd - defenderStats.spd >= 5 ? 4 : 0;
  const wardReduction = getTerrainAt(defender.pos) === "ward" ? 2 : 0;
  const forestReduction = getTerrainAt(defender.pos) === "forest" && defender.hero.moveType !== "Flying" ? 1 : 0;
  return Math.max(1, Math.floor(attack * triangle - defense * 0.65 + speedBonus - wardReduction - forestReduction));
}

function triangleMultiplier(attacker: string, defender: string) {
  if (attacker === "Solar" && defender === "Verdant") return 1.2;
  if (attacker === "Verdant" && defender === "Lunar") return 1.2;
  if (attacker === "Lunar" && defender === "Solar") return 1.2;
  if (attacker === "Verdant" && defender === "Solar") return 0.8;
  if (attacker === "Lunar" && defender === "Verdant") return 0.8;
  if (attacker === "Solar" && defender === "Lunar") return 0.8;
  return 1;
}

function findNearestEnemy(battle: BattleState, unit: BattleUnit) {
  return battle.units
    .filter((item) => item.side !== unit.side)
    .sort((a, b) => distance(unit.pos, a.pos) - distance(unit.pos, b.pos))[0];
}

function chooseCpuUnit(battle: BattleState) {
  const cpuUnits = battle.units.filter((item) => item.side === "cpu");
  return cpuUnits
    .map((unit) => ({
      unit,
      target: findNearestEnemy(battle, unit)
    }))
    .sort((a, b) => {
      if (!a.target) return 1;
      if (!b.target) return -1;
      return distance(a.unit.pos, a.target.pos) - distance(b.unit.pos, b.target.pos);
    })[0]?.unit;
}

function moveCpuToward(battle: BattleState, unit: BattleUnit, target: BoardPos) {
  const candidates: BoardPos[] = [];
  for (let x = 0; x < BOARD_WIDTH; x += 1) {
    for (let y = 0; y < BOARD_HEIGHT; y += 1) {
      const pos = { x, y };
      if (!isBlocked(pos) && !isOccupied(battle, pos) && distance(unit.pos, pos) <= moveDistance(unit)) {
        candidates.push(pos);
      }
    }
  }
  const best = candidates.sort((a, b) => distance(a, target) - distance(b, target))[0];
  return best ? moveUnit(battle, unit.uid, best) : battle;
}

function getBattleStatus(units: BattleUnit[]): BattleState["status"] {
  const hasPlayer = units.some((item) => item.side === "player");
  const hasCpu = units.some((item) => item.side === "cpu");
  if (!hasCpu) return "victory";
  if (!hasPlayer) return "defeat";
  return "active";
}

function isInsideBoard(pos: BoardPos) {
  return pos.x >= 0 && pos.x < BOARD_WIDTH && pos.y >= 0 && pos.y < BOARD_HEIGHT;
}

function isBlocked(pos: BoardPos) {
  return getTerrainAt(pos) === "wall" || getTerrainAt(pos) === "water";
}

function isOccupied(battle: BattleState, pos: BoardPos) {
  return battle.units.some((unit) => unit.pos.x === pos.x && unit.pos.y === pos.y);
}

function addLog(log: BattleLogEntry[], text: string, tone: BattleLogEntry["tone"]) {
  return [{ id: crypto.randomUUID(), text, tone }, ...log].slice(0, 8);
}

function saveState(state: GameState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}
