# AGENTS.md

Guidance for AI agents and developers working on this repository.

## Mission

Build an original mobile tactical hero-collection RPG inspired by the broad structure of Fire Emblem Heroes: players collect heroes through transparent gacha banners, build four-unit squads, and fight fast 2D grid battles in story, training, event, and arena modes.

This project must not clone Nintendo or Intelligent Systems intellectual property. Do not use Fire Emblem names, characters, emblems, story worlds, music, UI art, sprites, map layouts, icons, voice lines, animations, logos, or proprietary terminology except when discussing source-game analysis in documentation.

Hero content must be original. Do not recreate FEH heroes with renamed labels, similar silhouettes, signature weapons, personal skills, backstories, color schemes, or role combinations that make them recognizable as the same character. Every playable hero needs an original name, faction, visual silhouette, personality, weapon fantasy, and kit identity.

## Product Direction

Working title: **Astral Tactics: Covenant Arena**

Target experience:

- Portrait-first mobile game for iOS and Android.
- Session length: 1 to 5 minutes per battle.
- Team size: 4 heroes by default.
- Battle format: 2D square-grid tactical arena with touch/drag movement and attacks.
- Progression: collect, level, promote, equip, merge duplicates, unlock skills, clear PvE maps, and compete in asynchronous PvP arena seasons.
- Business model: free-to-play with shop credits used to open hero packs, transparent gacha odds, pity protection, purchase limits, and regional compliance.
- Current development shop: players may claim any number of credits for free. No real-money purchase flow is active until explicitly implemented later.

## Research Baseline

Fire Emblem Heroes uses the following high-level systems, which inform but do not define this project:

- Streamlined turn-based battles on small mobile maps with touch and drag controls.
- Color/weapon type advantages and disadvantages.
- Summoning with five randomly generated colored stones.
- Premium currency earned from story maps or bought in the shop.
- Hero customization through skills, equipment, team building, and growth.
- Reusable training maps, story maps, special maps, and ranked arena rewards.
- Arena scoring based on seasonal high score, chain wins, defenses, and bonus characters.
- Pity mechanics that improve 5-star rates after repeated lower-rarity summons.

Sources are listed in `README.md`.

## Recommended Technical Stack

Use this unless the user asks otherwise:

- Client: Unity LTS, C#, URP 2D, Addressables, TextMeshPro.
- Mobile services: Firebase or PlayFab for authentication, cloud save, remote config, analytics, crash reporting, and push notifications.
- Backend: TypeScript with NestJS for authoritative APIs, economy, summoning, inventory, events, arena snapshots, and future receipt validation.
- Database: PostgreSQL as the source of truth for accounts, wallets, credit ledgers, inventory, summon history, pity state, quests, and arena results.
- Supporting store: Redis for short-lived summon session state, idempotency locks, rate limits, arena opponent caches, queues, and temporary leaderboards. Do not use Redis as the source of truth for player-owned items or credits.
- ORM/query layer: Prisma or Drizzle. Prefer explicit transactions for all wallet, shop, summon, and inventory mutations.
- Build: GitHub Actions or another CI that produces Android and iOS builds from clean checkout.

If a web prototype is requested first, use a small React or Phaser prototype, but keep battle rules and content data portable so they can later move into Unity.

## Expected Repository Layout

Current prototype files:

```text
/
  AGENTS.md
  README.md
  package.json
  index.html
  vite.config.ts
  src/
    App.tsx
    main.tsx
    styles.css
    game/
      data.ts
      localGameService.ts
      types.ts
  public/
    assets/
      heroes/
        hero-portrait-atlas.png
        aria-vale.png
        bronn-keel.png
        selene-voss.png
        kaito-renn.png
        mira-solace.png
        nyx-calder.png
        toma-brask.png
        iri-quill.png
        oren-thatch.png
        vela-nadir.png
        cass-rook.png
        edda-rune.png
  artifacts/
    prototype-mobile.png
    prototype-desktop.png
    prototype-battle-updated-mobile.png
    prototype-anime-assets-mobile.png
    mobile-app-ui-home-v2.png
    mobile-app-ui-battle-v2.png
```

Current prototype state:

- Offline web prototype built with Vite, React, and TypeScript.
- Mobile-app shell with compact top resource header, scrollable content area, and bottom navigation.
- UI is inspired by mobile tactical RPG density and FEH-style interaction patterns, but uses original art, terminology, and layout treatment.
- Generated anime-style portrait assets are wired for all 12 original heroes.
- Free credit shop grants unlimited development credits.
- Hero packs cost 20 credits and reveal 5 heroes.
- Roster, summon reveal, selected-unit panel, and battle tokens use portrait assets.
- Battle is player-vs-CPU on a 6x8 arena with roads, forest, water, wall, plain, and ward tiles.
- Turn flow is alternating one-unit turns: player selects one hero to move/attack/wait, CPU acts with one unit, then control returns to player.
- Battle ends when either the player side or CPU side has no heroes remaining.
- Keep new gameplay systems behind a service boundary so `localGameService` can later be replaced with REST calls to the NestJS backend.

Long-term production layout should move toward this shape:

```text
/
  AGENTS.md
  README.md
  docs/
    design/
      battle-system.md
      economy-gacha.md
      hero-content-guide.md
      liveops-calendar.md
    technical/
      architecture.md
      api-contracts.md
      data-schemas.md
      qa-plan.md
  game/
    Assets/
      _Project/
        Art/
        Audio/
        Battle/
        Collection/
        Content/
        Economy/
        Input/
        LiveOps/
        Meta/
        UI/
        Utilities/
      AddressableAssetsData/
    Packages/
    ProjectSettings/
  server/
    src/
      accounts/
      arena/
      content/
      economy/
      inventory/
      receipts/
      summon/
    tests/
  shared/
    schemas/
    balancing/
    generated/
  tools/
    content-pipeline/
    simulators/
    validation/
```

## Core Gameplay Requirements

### Battle

- Grid: default 6 columns by 8 rows; support 5x7 through 8x10 for events.
- Team: player squad of 4 heroes versus 3 to 6 enemies.
- Turn structure: player phase, enemy phase, victory/defeat evaluation.
- Controls: tap hero, show move range, tap destination, tap target or drag hero over target.
- Movement types:
  - Infantry: 2 tiles, normal terrain.
  - Cavalry: 3 tiles, blocked by forest/rubble.
  - Armored: 1 tile, high stats.
  - Flying: 2 tiles, ignores most terrain, vulnerable to anti-air.
  - Mystic: 2 tiles, terrain-dependent caster class.
- Attack ranges:
  - Melee: 1 tile.
  - Ranged: 2 tiles.
  - Siege/event weapons: 3 tiles only when explicitly balanced.
- Terrain:
  - Plain: normal.
  - Forest: costs +1 movement for infantry/mystic, blocks cavalry.
  - Wall/water/lava: blocks most units.
  - Defensive tile: grants damage reduction or defense bonus.
  - Hazard tile: applies damage/status at phase start.
- Objectives:
  - Rout all enemies.
  - Survive N turns.
  - Defeat boss.
  - Protect ally/structure.
  - Capture tile.
- Combat must be deterministic given combatants, map state, and RNG seed.
- Never let client-authoritative battle results grant premium rewards without server validation.

### Combat Formula

Use this as the first playable baseline:

```text
attackPower = attacker.atk + weapon.might + visibleBuffs.atk - visibleDebuffs.atk
defensePower = defender.def or defender.res based on damage type
triangleMultiplier = 1.2 if advantaged, 0.8 if disadvantaged, otherwise 1.0
effectiveMultiplier = 1.5 if weapon is effective against defender movement/type
rawDamage = floor((attackPower * triangleMultiplier * effectiveMultiplier) - defensePower)
finalDamage = max(0, rawDamage + trueDamage - flatReduction)
```

Follow-up attack rule:

```text
attacker gets a natural follow-up if attacker.spd - defender.spd >= 5
defender counterattacks if alive and target is within defender range
skills may grant, deny, or reorder follow-ups
```

Special charge rule:

```text
normal attack or counterattack: +1 charge
skill modifiers may add/subtract charge
special triggers when charge >= cooldown and trigger condition is met
after trigger, charge resets to 0 unless skill says otherwise
```

### Hero System

Each hero needs:

- Stable content id.
- Display name and title.
- Faction/realm.
- Rarity availability: 3-star, 4-star, 5-star, limited, legendary, event.
- Element/color: Solar, Lunar, Verdant, Neutral, or another original set.
- Weapon type: blade, lance, axe, bow, dagger, tome, staff, beast, device, etc.
- Movement type.
- Damage type: physical, magical, hybrid, fixed.
- Base stats and growths: HP, Atk, Spd, Def, Res.
- Level cap, rarity cap, promotion requirements.
- Skills: weapon, assist, special, passive A, passive B, passive C, passive seal.
- Voice line keys, portrait keys, sprite/animation keys.
- Tags for AI, banner eligibility, quests, and balance cohorts.

Do not hard-code hero stats in gameplay code. Use validated data files or ScriptableObjects generated from shared schemas.

### Original Launch Roster

Use the following original 12-hero roster for MVP planning. These are not FEH characters and should define the first set of playable archetypes.

| Hero | Faction | Range | Damage | Move | Element | Weapon | Rarity | Role |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Aria Vale | Dawn Covenant | Melee | Physical | Infantry | Solar | Sunsteel blade | 4-5 | Fast duelist and tutorial lead |
| Bronn Keel | Ironbound Freehold | Melee | Physical | Armored | Verdant | Anchor axe | 3-4 | Defensive wall and choke-holder |
| Selene Voss | Moon Archive | Ranged | Magical | Mystic | Lunar | Glass-moon tome | 5 | Burst mage with cooldown tricks |
| Kaito Renn | Windstep Caravan | Ranged | Physical | Cavalry | Neutral | Recurve bow | 4-5 | Mobile archer and flier counter |
| Mira Solace | Dawn Covenant | Ranged | Magical | Infantry | Solar | Healing prism | 3-5 | Staff healer and cleanse support |
| Nyx Calder | Umbral Court | Melee | Magical | Flying | Lunar | Shadow talons | 5 | Magical flier assassin |
| Toma Brask | Ironbound Freehold | Melee | Physical | Cavalry | Verdant | Drill lance | 3-4 | Beginner cavalry initiator |
| Iri Quill | Inkspire Guild | Ranged | Physical | Infantry | Neutral | Needle daggers | 4 | Debuffer and chip damage scout |
| Oren Thatch | Wildroot Pact | Melee | Hybrid | Infantry | Verdant | Living gauntlets | 4-5 | Brawler with self-healing |
| Vela Nadir | Starfall Choir | Ranged | Magical | Flying | Solar | Comet lyre | 5 | Flying support mage and buffer |
| Cass Rook | Blackpowder League | Ranged | Physical | Armored | Neutral | Hand cannon | 4-5 | Slow ranged tank and zone control |
| Edda Rune | Frostveil Seminary | Ranged | Magical | Mystic | Lunar | Frost sigils | 3-4 | Control caster with terrain slows |

Starter grants:

- Tutorial pair: Aria Vale and Bronn Keel.
- First guided summon guarantee: one of Mira Solace, Toma Brask, Iri Quill, or Edda Rune.
- First limited hero battle reward: Oren Thatch at 4-star.

Roster balance requirements:

- Include at least four melee heroes and four ranged heroes in MVP.
- Include at least four physical attackers, four magical attackers, and one hybrid attacker.
- Include at least one accessible healer/support that is not locked to 5-star rarity.
- Keep 5-star heroes exciting through unique skills, but do not make basic combat roles unavailable to free players.

### Skills

Skills must be data-driven. Use a trigger/effect model:

- Triggers: combat start, before attack, after attack, phase start, phase end, ally within N tiles, HP threshold, special trigger, movement start, death, summon acquisition.
- Conditions: unit type, weapon type, range, HP percentage, visible status, terrain, ally/enemy count, turn count.
- Effects: stat modify, damage modify, healing, movement modify, status apply/remove, cooldown modify, extra action, warp, terrain create/remove.

Skill code may implement reusable primitives, but content should compose those primitives through data.

### Gacha and Economy

All summoning must be server-authoritative.

Shop rules:

- Players purchase or claim **credits** from the shop.
- Credits are spent to open hero packs/summon sessions.
- Individual heroes cannot be bought directly from the shop.
- For the current development build, every credit pack costs 0 real money and can be claimed unlimited times.
- The free-credit shop is a temporary development/testing configuration, not the final monetization balance.
- Even while credits are free, the game should still record credit grants/spends in the same ledger format planned for real currency.

Baseline banner design:

- One summon session produces 5 colored crystals.
- Crystal color indicates the hero pool category, giving players partial agency.
- First crystal costs 5 credits.
- Additional crystals in the same session cost 4, 4, 4, then 3 credits.
- Full session costs 20 credits.
- Standard rates:
  - 5-star focus: 3.0%.
  - 5-star standard: 3.0%.
  - 4-star: 58.0%.
  - 3-star: 36.0%.
- Pity: after every 5 summons without any 5-star hero on that banner, increase total 5-star rate by +0.5 percentage points split evenly between focus and standard pools.
- Reset: any 5-star pull resets pity for that banner.
- Spark: after 40 summons on eligible banners, player may choose one focus hero once.
- Duplicate handling:
  - Merge duplicate into same hero for small stat/skill-point bonuses.
  - Convert duplicate into shard/manual for skill inheritance.
  - Dismiss duplicate into non-premium upgrade currency.
- Free credit sources: development shop claims, story clears, quests, login bonuses, arena seasons, event milestones, achievement tracks.
- Paid credits must be tracked separately by platform when real-money purchases are enabled later.
- Always disclose rates, pool contents, pity state, and spark progress in the UI before purchase.

### Meta Modes

MVP modes:

- Story: chapters with dialogue, tutorials, and escalating battle objectives.
- Training Tower: repeatable randomized maps for EXP/materials.
- Special Battles: limited-time hero recruitment maps and challenge maps.
- Arena: asynchronous PvP against stored defense-team snapshots.
- Quests: daily, weekly, event, and tutorial missions.

Post-MVP modes:

- Guild raids/cooperative boss score events.
- Draft arena.
- Roguelite tower.
- Seasonal event maps with unique terrain hazards.

### Arena

Arena is asynchronous. Do not require real-time PvP for MVP.

- Player sets a defense team snapshot.
- Attacker receives three opponent choices: easy, normal, hard.
- Score considers opponent power, chain length, survival, turn count, and seasonal bonus heroes.
- Season length: one week.
- Rewards: upgrade materials, non-premium currency, cosmetics, limited shards.
- Defense wins grant minor rewards but should not dominate rankings.

### AI

Implement battle AI in layers:

- Threat map generation.
- Objective priority.
- Target scoring.
- Move selection.
- Skill use.
- Tie-breaker seeded randomness.

AI must be deterministic for replay validation.

## Data Contracts

Example hero definition:

```json
{
  "id": "hero_aria_dawn_sentinel",
  "nameKey": "hero.aria.name",
  "titleKey": "hero.aria.title",
  "faction": "dawn_covenant",
  "rarityAvailability": [4, 5],
  "element": "solar",
  "weaponType": "blade",
  "moveType": "infantry",
  "damageType": "physical",
  "baseStats": { "hp": 18, "atk": 9, "spd": 10, "def": 6, "res": 5 },
  "growths": { "hp": 0.55, "atk": 0.55, "spd": 0.6, "def": 0.35, "res": 0.3 },
  "skills": {
    "weapon": "skill_sunsteel_edge",
    "assist": null,
    "special": "skill_radiant_lunge",
    "passiveA": "skill_atk_spd_oath_1",
    "passiveB": null,
    "passiveC": null
  },
  "assetKeys": {
    "portrait": "portrait_aria_default",
    "battleSprite": "sprite_aria_default",
    "voiceSet": "voice_aria_en"
  }
}
```

Example map definition:

```json
{
  "id": "map_story_01_01",
  "size": { "width": 6, "height": 8 },
  "terrain": [
    "PPPPPP",
    "PFFPDP",
    "PPPPPP",
    "PWWWWP",
    "PPPPPP",
    "PDPPFP",
    "PPPPPP",
    "PPPPPP"
  ],
  "playerSpawn": [{ "x": 1, "y": 6 }, { "x": 2, "y": 6 }, { "x": 3, "y": 6 }, { "x": 4, "y": 6 }],
  "enemyUnits": [
    { "heroId": "enemy_bandit_axe_01", "level": 3, "rarity": 3, "x": 2, "y": 1 },
    { "heroId": "enemy_scout_bow_01", "level": 3, "rarity": 3, "x": 4, "y": 1 }
  ],
  "objective": { "type": "rout" },
  "turnLimit": null,
  "rewards": [{ "type": "premium_currency", "amount": 1, "firstClearOnly": true }]
}
```

## Backend Requirements

Preferred backend design:

- Language: TypeScript.
- Framework: NestJS.
- API style: REST first with OpenAPI documentation.
- Primary database: PostgreSQL.
- Cache/locks/rate limits: Redis.
- Architecture: modular monolith for MVP, split into services only after scale or team boundaries require it.

Server-authoritative systems:

- Account creation/login token exchange.
- Cloud save and inventory.
- Credit ledger for shop claims, rewards, spends, and future paid purchases.
- Shop catalog and credit pack claim/purchase validation.
- Purchase receipt validation.
- Summoning result generation.
- Banner state, pity, spark, and pool validation.
- Quest progress and reward claims.
- Event schedule and remote config.
- Arena defense snapshot upload, matchmaking, scoring, and reward distribution.
- Anti-cheat checks for impossible battle results or inventory states.

Recommended NestJS modules:

- `AuthModule`: guest sessions, platform identity linking, token refresh.
- `PlayerModule`: profile, settings, tutorial flags, cloud save summary.
- `WalletModule`: credit balances, credit ledger, spend/grant transactions.
- `ShopModule`: shop catalog, free credit pack claims, future purchase products.
- `SummonModule`: summon sessions, crystal generation, hero pack pulls, pity, spark.
- `InventoryModule`: hero instances, duplicates, merges, materials, equipment.
- `BattleModule`: battle start/complete validation, rewards, deterministic replay checks.
- `QuestModule`: quest progress, completion, reward claims.
- `ArenaModule`: defense snapshots, opponent selection, scoring, season rewards.
- `ContentModule`: versioned content manifest, banners, heroes, skills, maps, events.

PostgreSQL tables to create early:

- `players`
- `player_sessions`
- `wallets`
- `credit_ledger_entries`
- `shop_credit_packs`
- `shop_claims`
- `banners`
- `summon_sessions`
- `summon_results`
- `banner_player_state`
- `hero_instances`
- `player_materials`
- `quest_progress`
- `battle_runs`
- `arena_defense_snapshots`
- `arena_battle_results`

All credit changes must happen inside database transactions and create immutable ledger entries. The current free shop still uses the same ledger path as future paid credit packs.

Suggested API endpoints:

```text
POST /v1/auth/session
GET  /v1/player/state
POST /v1/player/sync
GET  /v1/player/wallet
GET  /v1/content/manifest
GET  /v1/events/active
GET  /v1/banners
GET  /v1/shop/catalog
POST /v1/shop/credits/claim-free
POST /v1/summon/session/start
POST /v1/summon/session/pull
POST /v1/summon/spark
POST /v1/battle/start
POST /v1/battle/complete
GET  /v1/arena/opponents
POST /v1/arena/battle/complete
POST /v1/purchase/validate
```

## Art and Audio Direction

Original art only.

- Character portraits: expressive illustrated busts with strong silhouettes.
- Battle sprites: readable chibi or stylized 2D rigs sized for phone screens.
- Maps: clean tile language with obvious movement blockers and danger tiles.
- UI: portrait-first, thumb-friendly, no nested card clutter.
- Audio: short tactical SFX, summon reveal stingers, map music loops, character barks.
- Accessibility: colorblind-safe advantage indicators, reduced motion option, text speed, scalable UI, captions for voiced story scenes.

## Compliance and Safety

Required before real-money launch:

- Display exact gacha probabilities and complete pool contents.
- Keep immutable transaction ledgers.
- Validate App Store and Google Play receipts server-side.
- Implement parental controls and purchase limits where required.
- Respect platform rules for paid currency, refunds, subscriptions, and cross-platform currency restrictions.
- Provide account deletion/export flows for GDPR/CCPA-style requests.
- Do not market paid random rewards to children.
- Maintain regional configuration for countries with loot-box/gacha disclosure rules.

## Implementation Standards

- Keep battle logic deterministic and unit-tested.
- Use data validation for every content file before it ships.
- Separate pure rules from Unity presentation code.
- Prefer small services with explicit contracts over global mutable state.
- Treat premium currency, summon, and inventory code as high-risk.
- Add tests for all bug fixes in battle, economy, summoning, and inventory systems.
- Avoid unrelated refactors.
- Do not check in generated build output, secrets, keystores, provisioning profiles, or store credentials.

## Verification Checklist

Before calling work complete:

- Project opens from clean checkout.
- Automated tests pass.
- Content validation passes.
- A new account can complete tutorial, summon, build a team, clear a map, and claim rewards.
- Summon odds simulator matches configured rates within expected confidence ranges.
- Battle replay with same seed produces same result.
- Mobile UI is verified on narrow and tall aspect ratios.
- No copyrighted Fire Emblem assets, terms, or names are present in playable content.
