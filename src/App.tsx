import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  BadgeInfo,
  Coins,
  Crosshair,
  RotateCcw,
  Shield,
  ShoppingBag,
  Sparkles,
  Swords,
  Users
} from "lucide-react";
import { getHero, HERO_PACK_COST } from "./game/data";
import {
  attackRange,
  distance,
  getBoardSize,
  getBattleStats,
  getCreditPacks,
  getTerrainAt,
  localGameService,
  moveDistance
} from "./game/localGameService";
import type { BattleAnimation, BattleState, BattleUnit, BoardPos, GameState, HeroDefinition, HeroInstance } from "./game/types";

type Screen = "home" | "summon" | "heroes" | "battle";

const elementClass: Record<string, string> = {
  Solar: "solar",
  Lunar: "lunar",
  Verdant: "verdant",
  Neutral: "neutral"
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [gameState, setGameState] = useState<GameState>(() => localGameService.loadState());
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [lastPack, setLastPack] = useState<HeroInstance[]>([]);
  const teamPreview = useMemo(() => gameState.roster.slice(0, 4), [gameState.roster]);

  function claimCredits(packId: string) {
    setGameState(localGameService.claimCreditPack(gameState, packId));
  }

  function openPack() {
    const result = localGameService.openHeroPack(gameState);
    setGameState(result.state);
    setLastPack(result.heroes);
    if (result.heroes.length > 0) {
      setScreen("summon");
    }
  }

  function startBattle() {
    const nextBattle = localGameService.startBattle(gameState);
    setBattle(nextBattle);
    setScreen("battle");
  }

  function resetProgress() {
    const next = localGameService.resetProgress();
    setGameState(next);
    setBattle(null);
    setLastPack([]);
    setScreen("home");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="crest">AT</div>
          <div>
            <h1>Astral Tactics</h1>
            <p>Covenant Arena prototype</p>
          </div>
        </div>
        <div className="wallet">
          <Coins size={18} />
          <strong>{gameState.credits}</strong>
          <span>Credits</span>
        </div>
      </header>

      <main>
        {screen === "home" && (
          <HomeScreen
            state={gameState}
            team={teamPreview}
            onClaim={claimCredits}
            onOpenPack={openPack}
            onStartBattle={startBattle}
            onReset={resetProgress}
          />
        )}
        {screen === "summon" && <SummonScreen state={gameState} lastPack={lastPack} onOpenPack={openPack} />}
        {screen === "heroes" && <HeroesScreen state={gameState} />}
        {screen === "battle" && (
          <BattleScreen
            battle={battle}
            onStart={startBattle}
            onChange={setBattle}
          />
        )}
      </main>

      <nav className="tabs" aria-label="Main">
        <TabButton active={screen === "home"} icon={<ShoppingBag size={18} />} label="Shop" onClick={() => setScreen("home")} />
        <TabButton active={screen === "summon"} icon={<Sparkles size={18} />} label="Packs" onClick={() => setScreen("summon")} />
        <TabButton active={screen === "heroes"} icon={<Users size={18} />} label="Heroes" onClick={() => setScreen("heroes")} />
        <TabButton active={screen === "battle"} icon={<Swords size={18} />} label="Battle" onClick={() => setScreen("battle")} />
      </nav>
    </div>
  );
}

function TabButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button className={`tab ${active ? "active" : ""}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function HomeScreen({
  state,
  team,
  onClaim,
  onOpenPack,
  onStartBattle,
  onReset
}: {
  state: GameState;
  team: HeroInstance[];
  onClaim: (packId: string) => void;
  onOpenPack: () => void;
  onStartBattle: () => void;
  onReset: () => void;
}) {
  return (
    <section className="screen-grid">
      <div className="panel wide hero-stage">
        <div className="stage-copy">
          <p className="eyebrow">Anime fantasy tactical RPG</p>
          <h2>Build a covenant squad, open hero packs, and challenge the CPU arena.</h2>
          <div className="hero-actions">
            <button className="primary-action" onClick={onOpenPack} disabled={state.credits < HERO_PACK_COST}>
              <Sparkles size={18} />
              Open 5-Hero Pack
            </button>
            <button className="secondary-action" onClick={onStartBattle}>
              <Swords size={18} />
              Start Battle
            </button>
          </div>
        </div>
        <div className="team-fan" aria-label="Current team">
          {team.map((instance) => (
            <HeroPortrait key={instance.instanceId} hero={getHero(instance.heroId)} rarity={instance.rarity} />
          ))}
        </div>
      </div>

      <div className="panel">
        <PanelTitle icon={<ShoppingBag size={18} />} title="Free Credit Shop" />
        <div className="pack-list">
          {getCreditPacks().map((pack) => (
            <button className="credit-pack" key={pack.id} onClick={() => onClaim(pack.id)}>
              <span>{pack.name}</span>
              <strong>+{pack.credits}</strong>
              <em>{pack.priceLabel}</em>
            </button>
          ))}
        </div>
      </div>

      <div className="panel">
        <PanelTitle icon={<BadgeInfo size={18} />} title="Prototype Rules" />
        <ul className="plain-list">
          <li>Credits are free and unlimited for now.</li>
          <li>Individual heroes are not sold directly.</li>
          <li>Each hero pack reveals 5 random heroes.</li>
          <li>Battle is offline player vs CPU.</li>
        </ul>
        <button className="text-action" onClick={onReset}>
          <RotateCcw size={16} />
          Reset local progress
        </button>
      </div>
    </section>
  );
}

function SummonScreen({ state, lastPack, onOpenPack }: { state: GameState; lastPack: HeroInstance[]; onOpenPack: () => void }) {
  return (
    <section className="stack">
      <div className="panel summon-panel">
        <div>
          <p className="eyebrow">Hero pack</p>
          <h2>Five heroes, one pack, no direct hero purchases.</h2>
          <p className="muted">Cost: {HERO_PACK_COST} Credits. Current development shop grants credits for free.</p>
        </div>
        <button className="primary-action" onClick={onOpenPack} disabled={state.credits < HERO_PACK_COST}>
          <Sparkles size={18} />
          Open Pack
        </button>
      </div>

      {lastPack.length > 0 && (
        <div className="panel">
          <PanelTitle icon={<Sparkles size={18} />} title="Latest Reveal" />
          <div className="hero-grid reveal-grid">
            {lastPack.map((instance) => (
              <HeroCard key={instance.instanceId} instance={instance} />
            ))}
          </div>
        </div>
      )}

      <div className="panel">
        <PanelTitle icon={<Shield size={18} />} title="Summon Rates" />
        <div className="rates">
          <Rate label="5-Star" value="6%" />
          <Rate label="4-Star" value="58%" />
          <Rate label="3-Star" value="36%" />
        </div>
      </div>
    </section>
  );
}

function HeroesScreen({ state }: { state: GameState }) {
  return (
    <section className="stack">
      <div className="panel roster-summary">
        <PanelTitle icon={<Users size={18} />} title="Hero Roster" />
        <p className="muted">{state.roster.length} heroes collected. The first four heroes form your arena team.</p>
      </div>
      <div className="hero-grid">
        {state.roster.map((instance) => (
          <HeroCard key={instance.instanceId} instance={instance} />
        ))}
      </div>
    </section>
  );
}

function BattleScreen({
  battle,
  onStart,
  onChange
}: {
  battle: BattleState | null;
  onStart: () => void;
  onChange: (battle: BattleState) => void;
}) {
  const cpuTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (cpuTimerRef.current !== null) {
        window.clearTimeout(cpuTimerRef.current);
      }
    };
  }, []);

  if (!battle) {
    return (
      <section className="empty-state">
        <Swords size={32} />
        <h2>No active arena trial</h2>
        <button className="primary-action" onClick={onStart}>Start Battle</button>
      </section>
    );
  }

  const activeBattle = battle;
  const selected = activeBattle.units.find((unit) => unit.uid === activeBattle.selectedUid) ?? null;
  const committedUnit = activeBattle.units.find((unit) => unit.side === "player" && unit.moved && !unit.acted);
  const awaitingCpu =
    activeBattle.status === "active" &&
    activeBattle.phase === "player" &&
    activeBattle.animation?.attackerSide === "player";

  function finishPlayerAction(nextBattle: BattleState) {
    if (cpuTimerRef.current !== null) {
      window.clearTimeout(cpuTimerRef.current);
      cpuTimerRef.current = null;
    }

    if (nextBattle.status !== "active") {
      onChange(nextBattle);
      return;
    }

    if (nextBattle.animation?.attackerSide === "player") {
      onChange(nextBattle);
      cpuTimerRef.current = window.setTimeout(() => {
        onChange(localGameService.runCpuPhase(nextBattle));
        cpuTimerRef.current = null;
      }, 760);
      return;
    }

    onChange(localGameService.runCpuPhase(nextBattle));
  }

  function handleCell(pos: BoardPos) {
    if (awaitingCpu) return;
    if (activeBattle.phase !== "player" || activeBattle.status !== "active") return;
    const unit = activeBattle.units.find((item) => item.pos.x === pos.x && item.pos.y === pos.y);
    const selectedUnit = activeBattle.units.find((item) => item.uid === activeBattle.selectedUid);

    if (unit?.side === "player" && !unit.acted) {
      if (committedUnit && committedUnit.uid !== unit.uid) return;
      onChange({ ...activeBattle, selectedUid: unit.uid });
      return;
    }

    if (!selectedUnit || selectedUnit.acted) return;

    if (unit && unit.side === "cpu") {
      finishPlayerAction(localGameService.attackUnit(activeBattle, selectedUnit.uid, unit.uid));
      return;
    }

    if (!unit) {
      const nextBattle = localGameService.moveUnit(activeBattle, selectedUnit.uid, pos);
      if (nextBattle !== activeBattle) {
        finishPlayerAction(nextBattle);
      }
    }
  }

  return (
    <section className="battle-layout">
      <div className="panel battle-panel">
        <div className="battle-header">
          <div>
            <p className="eyebrow">Turn {activeBattle.turn}</p>
            <h2>{activeBattle.status === "active" ? `${activeBattle.phase === "player" ? "Player" : "CPU"} Turn` : activeBattle.status}</h2>
          </div>
          <div className={`phase-pill ${activeBattle.status}`}>{activeBattle.status}</div>
        </div>
        <BattleBoard battle={activeBattle} selected={selected} onCell={handleCell} locked={awaitingCpu} />
        <div className="battle-actions">
          <button className="text-action" onClick={onStart}>
            <RotateCcw size={16} />
            New Trial
          </button>
        </div>
      </div>

      <aside className="panel battle-sidebar">
        <PanelTitle icon={<Crosshair size={18} />} title="Selected" />
        {selected ? <UnitDetails unit={selected} /> : <p className="muted">Select a player hero.</p>}
        <div className="log">
          {activeBattle.log.map((entry) => (
            <p className={`log-line ${entry.tone}`} key={entry.id}>{entry.text}</p>
          ))}
        </div>
      </aside>
    </section>
  );
}

function BattleBoard({
  battle,
  selected,
  onCell,
  locked
}: {
  battle: BattleState;
  selected: BattleUnit | null;
  onCell: (pos: BoardPos) => void;
  locked: boolean;
}) {
  const { width, height } = getBoardSize();
  const cells: BoardPos[] = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      cells.push({ x, y });
    }
  }

  return (
    <div className={`board ${locked ? "input-locked" : ""}`} style={{ "--cols": width, "--rows": height } as CSSProperties}>
      {cells.map((pos) => {
        const unit = battle.units.find((item) => item.pos.x === pos.x && item.pos.y === pos.y);
        const terrain = getTerrainAt(pos);
        const blocked = terrain === "wall" || terrain === "water";
        const reachable = selected && selected.side === "player" && !selected.acted && !unit && !blocked && distance(selected.pos, pos) <= moveDistance(selected);
        const attackable = selected && unit?.side === "cpu" && distance(selected.pos, unit.pos) <= attackRange(selected);
        return (
          <button
            className={`cell terrain-${terrain} ${blocked ? "blocked" : ""} ${reachable ? "reachable" : ""} ${attackable ? "attackable" : ""}`}
            key={`${pos.x}-${pos.y}`}
            onClick={() => onCell(pos)}
            disabled={locked}
            aria-label={`${terrain} tile ${pos.x},${pos.y}`}
          >
            <span className="terrain-mark" aria-hidden="true" />
            {unit && <UnitToken unit={unit} selected={unit.uid === selected?.uid} />}
          </button>
        );
      })}
      {battle.animation && <CombatCollision key={battle.animation.id} animation={battle.animation} />}
    </div>
  );
}

function CombatCollision({ animation }: { animation: BattleAnimation }) {
  const dx = animation.defenderFrom.x - animation.attackerFrom.x;
  const dy = animation.defenderFrom.y - animation.attackerFrom.y;
  const attackerStyle = {
    gridColumn: animation.attackerFrom.x + 1,
    gridRow: animation.attackerFrom.y + 1,
    "--tx": `${dx * 42}%`,
    "--ty": `${dy * 42}%`,
    "--tx-back": `${dx * 7}%`,
    "--ty-back": `${dy * 7}%`
  } as CSSProperties;
  const defenderStyle = {
    gridColumn: animation.defenderFrom.x + 1,
    gridRow: animation.defenderFrom.y + 1,
    "--rx": `${dx * -18}%`,
    "--ry": `${dy * -18}%`
  } as CSSProperties;
  const impactStyle = {
    gridColumn: animation.defenderFrom.x + 1,
    gridRow: animation.defenderFrom.y + 1
  } as CSSProperties;

  return (
    <div className="combat-collision" aria-hidden="true">
      <div className={`combat-ghost ${animation.attackerSide} attacker`} style={attackerStyle}>
        <img src={animation.attackerHero.portrait} alt="" />
        <span>{heroInitials(animation.attackerHero)}</span>
      </div>
      <div className={`combat-ghost ${animation.defenderSide} defender ${animation.ko ? "ko" : ""}`} style={defenderStyle}>
        <img src={animation.defenderHero.portrait} alt="" />
        <span>{heroInitials(animation.defenderHero)}</span>
      </div>
      <div className={`impact-burst ${animation.ko ? "ko" : ""}`} style={impactStyle}>
        <strong>-{animation.damage}</strong>
      </div>
    </div>
  );
}

function UnitToken({ unit, selected }: { unit: BattleUnit; selected: boolean }) {
  return (
    <div
      className={`unit-token portrait-token ${unit.side} ${selected ? "selected" : ""} ${elementClass[unit.hero.element]}`}
      title={unit.hero.name}
    >
      <img src={unit.hero.portrait} alt="" />
      <span className="token-initials">{heroInitials(unit.hero)}</span>
      <small>{unit.hp}</small>
    </div>
  );
}

function heroInitials(hero: HeroDefinition) {
  return hero.name.split(" ").map((part) => part[0]).join("");
}

function UnitDetails({ unit }: { unit: BattleUnit }) {
  const stats = getBattleStats(unit);
  return (
    <div className="unit-details-wrap">
      <div className="unit-details">
        <HeroPortrait hero={unit.hero} rarity={unit.rarity} />
        <div>
          <h3>{unit.hero.name}</h3>
          <p>{unit.hero.title}</p>
          <span>{unit.hp}/{unit.maxHp} HP</span>
        </div>
      </div>
      <div className="unit-tags">
        <span>{unit.hero.weapon}</span>
        <span>{unit.hero.rangeType}</span>
        <span>{unit.hero.damageType}</span>
        <span>{unit.hero.moveType}</span>
      </div>
      <div className="stat-grid" aria-label={`${unit.hero.name} battle stats`}>
        <Stat label="HP" value={unit.hp} />
        <Stat label="ATK" value={stats.atk} />
        <Stat label="SPD" value={stats.spd} />
        <Stat label="DEF" value={stats.def} />
        <Stat label="RES" value={stats.res} />
        <Stat label="RNG" value={attackRange(unit)} />
        <Stat label="MOV" value={moveDistance(unit)} />
      </div>
      <p className="unit-note">{unit.hero.signature}: {unit.hero.role}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function HeroCard({ instance }: { instance: HeroInstance }) {
  const hero = getHero(instance.heroId);
  return (
    <article className="hero-card">
      <HeroPortrait hero={hero} rarity={instance.rarity} />
      <div className="hero-card-copy">
        <div>
          <h3>{hero.name}</h3>
          <p>{hero.title}</p>
        </div>
        <div className="trait-row">
          <span className={elementClass[hero.element]}>{hero.element}</span>
          <span>{hero.rangeType}</span>
          <span>{hero.damageType}</span>
        </div>
        <p className="signature">{hero.signature}</p>
      </div>
    </article>
  );
}

function HeroPortrait({ hero, rarity }: { hero: HeroDefinition; rarity: number }) {
  return (
    <div
      className="portrait art-portrait"
      style={{ "--a": hero.colors[0], "--b": hero.colors[1] } as CSSProperties}
      aria-label={`${hero.name} portrait`}
    >
      <img src={hero.portrait} alt="" />
      <span>{"★".repeat(rarity)}</span>
    </div>
  );
}

function PanelTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="panel-title">
      {icon}
      <h2>{title}</h2>
    </div>
  );
}

function Rate({ label, value }: { label: string; value: string }) {
  return (
    <div className="rate">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
