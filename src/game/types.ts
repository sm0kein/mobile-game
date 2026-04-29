export type ElementType = "Solar" | "Lunar" | "Verdant" | "Neutral";
export type MoveType = "Infantry" | "Cavalry" | "Armored" | "Flying" | "Mystic";
export type RangeType = "Melee" | "Ranged";
export type DamageType = "Physical" | "Magical" | "Hybrid";
export type Rarity = 3 | 4 | 5;
export type TeamSide = "player" | "cpu";
export type TerrainType = "plain" | "road" | "forest" | "water" | "wall" | "ward";

export type HeroDefinition = {
  id: string;
  name: string;
  title: string;
  faction: string;
  element: ElementType;
  moveType: MoveType;
  rangeType: RangeType;
  damageType: DamageType;
  weapon: string;
  rarityAvailability: Rarity[];
  role: string;
  signature: string;
  colors: [string, string];
  portrait: string;
  battleSprite: {
    src: string;
    col: number;
    row: number;
  };
  stats: {
    hp: number;
    atk: number;
    spd: number;
    def: number;
    res: number;
  };
};

export type HeroInstance = {
  instanceId: string;
  heroId: string;
  rarity: Rarity;
  level: number;
  merges: number;
  obtainedAt: string;
};

export type CreditPack = {
  id: string;
  name: string;
  credits: number;
  priceLabel: string;
};

export type LedgerEntry = {
  id: string;
  type: "grant" | "spend";
  amount: number;
  reason: string;
  createdAt: string;
};

export type GameState = {
  credits: number;
  roster: HeroInstance[];
  ledger: LedgerEntry[];
  summonHistory: HeroInstance[][];
};

export type BoardPos = {
  x: number;
  y: number;
};

export type BattleUnit = {
  uid: string;
  side: TeamSide;
  hero: HeroDefinition;
  rarity: Rarity;
  hp: number;
  maxHp: number;
  pos: BoardPos;
  acted: boolean;
  moved: boolean;
};

export type BattleStats = {
  hp: number;
  atk: number;
  spd: number;
  def: number;
  res: number;
};

export type BattleLogEntry = {
  id: string;
  text: string;
  tone: "info" | "hit" | "ko" | "reward";
};

export type BattleAnimation = {
  id: string;
  type: "attack";
  attackerUid: string;
  defenderUid: string;
  attackerSide: TeamSide;
  defenderSide: TeamSide;
  attackerHero: HeroDefinition;
  defenderHero: HeroDefinition;
  attackerFrom: BoardPos;
  defenderFrom: BoardPos;
  damage: number;
  ko: boolean;
};

export type BattleState = {
  phase: TeamSide;
  turn: number;
  units: BattleUnit[];
  selectedUid: string | null;
  log: BattleLogEntry[];
  status: "active" | "victory" | "defeat";
  animation: BattleAnimation | null;
};
