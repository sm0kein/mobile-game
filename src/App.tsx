import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  BadgeInfo,
  Coins,
  Flag,
  Home as HomeIcon,
  RotateCcw,
  Shield,
  ShoppingBag,
  Sparkles,
  Swords,
  Users
} from "lucide-react";
import { getHero, HERO_PACK_COST } from "./game/data";
import {
  distance,
  getBoardSize,
  getBattleStats,
  getCreditPacks,
  getTerrainAt,
  isInAttackRange,
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
  const isBattleMode = screen === "battle" && battle !== null;

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

  function returnHomeFromBattle() {
    setBattle(null);
    setScreen("home");
  }

  return (
    <div className={`app-shell ${isBattleMode ? "battle-mode" : ""}`}>
      {!isBattleMode && (
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
      )}

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
            onHome={returnHomeFromBattle}
          />
        )}
      </main>

      {!isBattleMode && (
        <nav className="tabs" aria-label="Main">
          <TabButton active={screen === "home"} icon={<ShoppingBag size={18} />} label="Shop" onClick={() => setScreen("home")} />
          <TabButton active={screen === "summon"} icon={<Sparkles size={18} />} label="Packs" onClick={() => setScreen("summon")} />
          <TabButton active={screen === "heroes"} icon={<Users size={18} />} label="Heroes" onClick={() => setScreen("heroes")} />
          <TabButton active={screen === "battle"} icon={<Swords size={18} />} label="Battle" onClick={() => setScreen("battle")} />
        </nav>
      )}
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
  onChange,
  onHome
}: {
  battle: BattleState | null;
  onStart: () => void;
  onChange: (battle: BattleState) => void;
  onHome: () => void;
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
  if (activeBattle.status !== "active") {
    return (
      <BattleResultScreen
        battle={activeBattle}
        onHome={onHome}
        onRestart={onStart}
      />
    );
  }

  const selected = activeBattle.units.find((unit) => unit.uid === activeBattle.selectedUid) ?? null;
  function applyBattleChange(nextBattle: BattleState) {
    if (cpuTimerRef.current !== null) {
      window.clearTimeout(cpuTimerRef.current);
      cpuTimerRef.current = null;
    }

    onChange(nextBattle);
  }

  function handleEndTurn() {
    if (activeBattle.status !== "active" || activeBattle.phase !== "player") return;

    if (cpuTimerRef.current !== null) {
      window.clearTimeout(cpuTimerRef.current);
      cpuTimerRef.current = null;
    }

    onChange(localGameService.runCpuPhase(activeBattle));
  }

  function handleResign() {
    if (cpuTimerRef.current !== null) {
      window.clearTimeout(cpuTimerRef.current);
      cpuTimerRef.current = null;
    }

    onChange(localGameService.resignBattle(activeBattle));
  }

  function handleCell(pos: BoardPos) {
    if (activeBattle.phase !== "player" || activeBattle.status !== "active") return;
    const unit = activeBattle.units.find((item) => item.pos.x === pos.x && item.pos.y === pos.y);
    const selectedUnit = activeBattle.units.find((item) => item.uid === activeBattle.selectedUid);

    if (unit?.side === "player" && !unit.acted) {
      onChange({ ...activeBattle, selectedUid: unit.uid });
      return;
    }

    if (!selectedUnit || selectedUnit.acted) return;

    if (unit && unit.side === "cpu") {
      const isAttackable = selectedUnit.side === "player" && isInAttackRange(selectedUnit, unit.pos);
      if (isAttackable) {
        const nextBattle = localGameService.attackUnit(activeBattle, selectedUnit.uid, unit.uid);
        if (nextBattle !== activeBattle) {
          applyBattleChange(nextBattle);
        }
      } else {
        onChange({ ...activeBattle, selectedUid: unit.uid });
      }
      return;
    }

    if (!unit) {
      const nextBattle = localGameService.moveUnit(activeBattle, selectedUnit.uid, pos);
      if (nextBattle !== activeBattle) {
        applyBattleChange(nextBattle);
      }
    }
  }

  return (
    <section className="battle-layout">
      <div className="panel battle-panel">
        <UnitStatsBanner unit={selected} />
        <BattleBoard battle={activeBattle} selected={selected} onCell={handleCell} locked={false} />
        <div className="battle-controls" aria-label="Battle controls">
          <button className="battle-control resign" onClick={handleResign} disabled={activeBattle.status !== "active"}>
            <Flag size={18} />
            <span>Resign</span>
          </button>
          <button className="battle-control end-turn" onClick={handleEndTurn} disabled={activeBattle.status !== "active" || activeBattle.phase !== "player"}>
            <RotateCcw size={18} />
            <span>End Turn</span>
          </button>
        </div>
      </div>
    </section>
  );
}

function BattleResultScreen({
  battle,
  onHome,
  onRestart
}: {
  battle: BattleState;
  onHome: () => void;
  onRestart: () => void;
}) {
  const didWin = battle.status === "victory";

  return (
    <section className={`battle-result ${didWin ? "victory" : "defeat"}`}>
      <div className="battle-result-panel">
        <p className="eyebrow">Battle Complete</p>
        <h2>{didWin ? "You Win" : "You Lost"}</h2>
        <p className="muted">
          {didWin ? "The CPU squad has been routed." : "Your squad withdrew from the arena."}
        </p>
        <div className="battle-result-actions">
          <button className="primary-action" onClick={onRestart}>
            <RotateCcw size={18} />
            Restart Match
          </button>
          <button className="secondary-action" onClick={onHome}>
            <HomeIcon size={18} />
            Back Home
          </button>
        </div>
      </div>
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
        const reachable = selected && selected.side === "player" && !selected.acted && !selected.moved && !unit && !blocked && distance(selected.pos, pos) <= moveDistance(selected);
        const attackable = selected && unit?.side === "cpu" && isInAttackRange(selected, unit.pos);
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
        <BattleSprite hero={animation.attackerHero} />
        <span>{heroInitials(animation.attackerHero)}</span>
      </div>
      <div className={`combat-ghost ${animation.defenderSide} defender ${animation.ko ? "ko" : ""}`} style={defenderStyle}>
        <BattleSprite hero={animation.defenderHero} />
        <span>{heroInitials(animation.defenderHero)}</span>
      </div>
      <div className={`impact-burst ${animation.ko ? "ko" : ""}`} style={impactStyle}>
        <strong>-{animation.damage}</strong>
      </div>
    </div>
  );
}

function UnitToken({ unit, selected }: { unit: BattleUnit; selected: boolean }) {
  const hpPercent = Math.max(0, Math.round((unit.hp / unit.maxHp) * 100));
  return (
    <div
      className={`unit-token sprite-token ${unit.side} ${selected ? "selected" : ""} ${elementClass[unit.hero.element]}`}
      style={{ "--hp": `${hpPercent}%`, "--a": unit.hero.colors[0], "--b": unit.hero.colors[1] } as CSSProperties}
      title={unit.hero.name}
    >
      <span className="token-badge">{heroInitials(unit.hero)}</span>
      <BattleSprite hero={unit.hero} />
      <span className="hp-rail" aria-hidden="true"><span /></span>
      <small>{unit.hp}</small>
    </div>
  );
}

function BattleSprite({ hero }: { hero: HeroDefinition }) {
  return (
    <span
      className="battle-sprite"
      style={{
        backgroundImage: `url(${hero.battleSprite.src})`,
        backgroundPosition: `${(hero.battleSprite.col / 3) * 100}% ${(hero.battleSprite.row / 2) * 100}%`
      } as CSSProperties}
    />
  );
}

function heroInitials(hero: HeroDefinition) {
  return hero.name.split(" ").map((part) => part[0]).join("");
}

function UnitStatsBanner({ unit }: { unit: BattleUnit | null }) {
  if (!unit) {
    return <div className="unit-stats-banner empty" aria-hidden="true" />;
  }
  const stats = getBattleStats(unit);
  const hpPercent = Math.max(0, Math.round((unit.hp / unit.maxHp) * 100));

  return (
    <div className="unit-stats-banner">
      <div className="banner-left">
        <HeroPortrait hero={unit.hero} rarity={unit.rarity} />
      </div>
      <div className="banner-center">
        <div className="banner-name-row">
          <span className={`element-icon ${elementClass[unit.hero.element]}`} />
          <span className="hero-name">{unit.hero.name}</span>
          <span className="hero-lv">Lv. 1</span>
        </div>
        <div className="banner-hp-row">
          <span className="hp-label">HP</span>
          <div className="banner-hp-rail">
            <div className="banner-hp-fill" style={{ width: `${hpPercent}%` }} />
            <span className="hp-text">{unit.hp} / {unit.maxHp}</span>
          </div>
        </div>
        <div className="banner-stats-grid">
          <div className="stat-compact"><span>Atk</span><strong>{stats.atk}</strong></div>
          <div className="stat-compact"><span>Spd</span><strong>{stats.spd}</strong></div>
          <div className="stat-compact"><span>Def</span><strong>{stats.def}</strong></div>
          <div className="stat-compact"><span>Res</span><strong>{stats.res}</strong></div>
        </div>
      </div>
      <div className="banner-right">
        <div className="skill-row weapon-row">
          <span className="icon-weapon">⚔️</span>
          <span>{unit.hero.weapon}</span>
        </div>
        <div className="skill-row assist-row">
          <span className="icon-assist">🛡️</span>
          <span className="muted">-</span>
        </div>
        <div className="skill-row special-row">
          <span className="icon-special">✨</span>
          <span>{unit.hero.signature}</span>
        </div>
      </div>
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
