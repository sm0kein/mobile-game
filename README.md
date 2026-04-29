# Astral Tactics: Covenant Arena

An original mobile tactical hero-collection RPG plan inspired by the genre structure of Fire Emblem Heroes: summon heroes, build compact squads, and fight fast 2D grid battles in story, training, event, and arena modes.

This repository currently contains the build blueprint. No game code has been initialized yet.

## Inspiration Analysis: Fire Emblem Heroes

Fire Emblem Heroes succeeds because it compresses a tactics RPG into a phone-friendly loop:

- **Short tactical battles:** official materials describe streamlined turn-based maps that fit mobile play, with touch/drag controls and swipe-to-attack interaction.
- **Readable matchup system:** every hero has a color type that influences weapon advantages and disadvantages.
- **Collectible hero roster:** players summon and customize heroes, then build teams around weapons, movement, active skills, specials, and passive skills.
- **Gacha with partial agency:** summoning presents five random colored stones, letting players choose a color category while still preserving random rarity and unit outcomes.
- **Pity and protection:** standard banners begin at 3% 5-star focus and 3% 5-star non-focus, with rate increases after repeated lower-rarity summons. Modern banners also include focus-charge and spark-style protections on eligible events.
- **Mode ladder:** story maps, training maps, special recruitment/challenge maps, and arena create a daily loop from casual progression to competitive scoring.
- **Arena retention:** arena seasons reward high scores, chain wins, defense results, and bonus characters.
- **Live operations:** rotating banners, limited maps, quests, rewards, and new heroes keep players returning.

Sources:

- [Fire Emblem Heroes official system page](https://fire-emblem-heroes.com/en/system)
- [Learn with Sharena: Learn How Summoning Works](https://new-guide.fire-emblem-heroes.com/en-US/feh-2020.html)
- [Fire Emblem Heroes official FAQ](https://support.fire-emblem-heroes.com/en-US/faq)
- [Focus Charge official FAQ](https://faq.fire-emblem-heroes.com/hc/en-us/articles/16062686460569-About-the-Focus-Charge-Feature)
- [Fire Emblem Wiki overview](https://fireemblemwiki.org/wiki/Fire_Emblem_Heroes)

## Original Game Concept

Working title: **Astral Tactics: Covenant Arena**

Premise: fractured sky-realms are linked by ancient covenant gates. The player is a tactician who recruits champions from rival realms, resolves realm conflicts, and competes in sanctioned arena trials to decide which covenant gains influence each season.

Design boundaries:

- Use original factions, heroes, lore, UI, artwork, music, icons, names, maps, and terminology.
- Keep the genre pattern: collectible heroes, transparent gacha, four-unit squads, and compact tactical battles.
- Avoid copying Fire Emblem characters, story worlds, weapons, symbols, assets, exact layouts, or branded vocabulary.
- Design heroes from scratch. A hero should not be a renamed FEH unit with the same silhouette, personality, weapon fantasy, signature ability, or story role.

## Player Fantasy

The player should feel like a sharp commander and collector:

- Pull a rare hero and immediately imagine teams around them.
- Win battles by reading threat ranges, terrain, color matchups, movement, and skill timing.
- Improve favorite heroes over time instead of discarding them whenever new content arrives.
- Compete weekly without needing real-time PvP reflexes.
- Always understand what a summon can produce and how close pity/spark protection is.

## Core Loop

1. Claim login/quest rewards.
2. Spend stamina on story, training, events, or arena.
3. Earn hero EXP, materials, shards, and premium currency.
4. Summon on active banners or recruit from event maps.
5. Upgrade heroes through levels, skills, promotion, merges, and equipment.
6. Build squads for mode-specific objectives.
7. Push harder maps and improve arena season score.

## First-Time User Flow

1. Title and account creation.
2. Opening story scene.
3. Tutorial battle with two starter heroes.
4. Reward first premium currency bundle.
5. Guided first summon with a guaranteed 4-star or better hero.
6. Team-edit tutorial.
7. Second battle requiring movement, weapon advantage, and a special.
8. Unlock home screen, quests, story chapter 1, training, and beginner banner.
9. Arena unlocks after chapter 2 or player level 5.

## MVP Feature Set

Build these first:

- Account, cloud save, and local guest mode.
- Home screen with notifications, quests, banners, team shortcuts, and stamina.
- Shop screen where players can claim free credits for hero packs during development.
- Hero roster, details, leveling, skill equip, promote, merge, and dismiss.
- Summoning sessions with colored crystals, pity, spark, and visible rates.
- 2D grid battle system with deterministic combat.
- Story mode with 3 chapters, 15 total maps, and first-clear rewards.
- Training mode with repeatable maps and randomized enemies.
- Special hero battle mode with one recruitable hero event.
- Arena with asynchronous defense snapshots and weekly scoring.
- Content tools for heroes, skills, banners, maps, quests, and events.
- Analytics and crash reporting.

Post-MVP:

- Guilds.
- Cooperative raid boss score events.
- Draft arena.
- Roguelite tower.
- Friend assists.
- Cosmetics and room/base decoration.
- Seasonal story events.

## Battle Design

Default battle shape:

- Portrait layout.
- 6x8 square grid.
- 4-player squad versus 3 to 6 enemies.
- Player phase and enemy phase.
- Victory by routing enemies unless objective overrides it.
- Defeat when all player heroes fall or objective fails.

Controls:

- Tap hero to preview movement and threat.
- Tap valid tile to move.
- Tap target or drag hero over enemy to attack.
- Long-press enemy to view stats, skills, range, and predicted combat.
- Undo movement before attacking or using an assist.
- End Turn button must be thumb-accessible.

Unit movement:

| Type | Move | Identity |
| --- | ---: | --- |
| Infantry | 2 | Balanced, flexible terrain access |
| Cavalry | 3 | High reach, terrain-blocked |
| Armored | 1 | Slow, durable, high score value |
| Flying | 2 | Ignores most terrain, anti-air weakness |
| Mystic | 2 | Caster/support class with terrain tricks |

Combat stats:

- HP: health.
- Atk: attack.
- Spd: follow-up and dodge-oriented skills.
- Def: physical mitigation.
- Res: magical mitigation.

Combat baseline:

```text
attackPower = attacker.atk + weapon.might + visibleBuffs.atk - visibleDebuffs.atk
defensePower = defender.def or defender.res
triangleMultiplier = 1.2 advantage, 0.8 disadvantage, 1.0 neutral
effectiveMultiplier = 1.5 if weapon is effective against defender type
damage = max(0, floor(attackPower * triangleMultiplier * effectiveMultiplier - defensePower) + trueDamage - flatReduction)
```

Follow-up baseline:

```text
if attacker.spd - defender.spd >= 5:
  attacker performs a natural follow-up
```

Counterattack baseline:

```text
if defender survives and attacker is within defender range:
  defender counterattacks
```

## Hero Design

Hero roles:

- Duelist: high single-target pressure.
- Vanguard: front-line tank.
- Striker: mobile initiator.
- Ranger: ranged chip and finish.
- Arcanist: magical burst/debuffs.
- Warden: defensive support.
- Medic: healing and cleansing.
- Controller: terrain/status manipulation.

Attack categories:

- Melee physical: swords, axes, lances, gauntlets, hammers, claws.
- Melee magical: enchanted blades, spirit claws, rune weapons, relic fists.
- Ranged physical: bows, daggers, cannons, thrown weapons, devices.
- Ranged magical: tomes, sigils, prisms, staves, instruments, crystals.
- Hybrid: heroes who target different defenses through a skill, weapon stance, or special.

Rarity:

- 3-star: common heroes, simple kits, promotion candidates.
- 4-star: strong foundations, useful inheritance.
- 5-star: premium kits, unique weapon or signature skill.
- Legendary: seasonal arena bonus, rare identity-defining kit.
- Event: earned through maps, quests, or shard exchanges, not standard banners or direct shop purchase.

Progression:

- Level 1 to 40.
- Promotion raises rarity and unlocks higher stat cap/skills.
- Merging duplicate copies grants small permanent bonuses.
- Skill inheritance allows build creativity but must be constrained by weapon/move/type rules.
- Equipment refinements give older heroes long-term viability.

## Original Starter Hero Roster

The first roster should establish our own identity and give implementation enough variety to test melee, ranged, physical, magical, hybrid, support, cavalry, armored, flying, and control play. These characters are original to **Astral Tactics: Covenant Arena**.

| Hero | Title | Faction | Range | Damage | Move | Element | Weapon | Rarity | Gameplay Identity |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Aria Vale | Dawn Sentinel | Dawn Covenant | Melee | Physical | Infantry | Solar | Sunsteel blade | 4-5 | Fast tutorial lead who wins through speed, specials, and clean duels |
| Bronn Keel | Harbor Bulwark | Ironbound Freehold | Melee | Physical | Armored | Verdant | Anchor axe | 3-4 | Durable wall who protects allies and holds chokepoints |
| Selene Voss | Mirror Astrologer | Moon Archive | Ranged | Magical | Mystic | Lunar | Glass-moon tome | 5 | Premium burst mage who manipulates special cooldowns |
| Kaito Renn | Gale Courier | Windstep Caravan | Ranged | Physical | Cavalry | Neutral | Recurve bow | 4-5 | Mobile archer with anti-flying pressure and retreat tools |
| Mira Solace | Prism Medic | Dawn Covenant | Ranged | Magical | Infantry | Solar | Healing prism | 3-5 | Accessible healer who cleanses debuffs and enables new players |
| Nyx Calder | Velvet Eclipse | Umbral Court | Melee | Magical | Flying | Lunar | Shadow talons | 5 | Magical flier assassin who dives isolated ranged targets |
| Toma Brask | Roadbreaker | Ironbound Freehold | Melee | Physical | Cavalry | Verdant | Drill lance | 3-4 | Beginner-friendly cavalry initiator with simple charge bonuses |
| Iri Quill | Inkblade Informant | Inkspire Guild | Ranged | Physical | Infantry | Neutral | Needle daggers | 4 | Debuffer scout who weakens enemies before allies finish them |
| Oren Thatch | Briarhand | Wildroot Pact | Melee | Hybrid | Infantry | Verdant | Living gauntlets | 4-5 | Self-healing brawler who alternates physical hits and nature magic |
| Vela Nadir | Comet Cantor | Starfall Choir | Ranged | Magical | Flying | Solar | Comet lyre | 5 | Flying support mage who buffs allies and chips clustered enemies |
| Cass Rook | Rampart Gunner | Blackpowder League | Ranged | Physical | Armored | Neutral | Hand cannon | 4-5 | Slow ranged tank who controls lanes and punishes enemy advances |
| Edda Rune | Frost Scribe | Frostveil Seminary | Ranged | Magical | Mystic | Lunar | Frost sigils | 3-4 | Control caster who slows movement and teaches terrain strategy |

Starter distribution:

- Tutorial heroes: Aria Vale and Bronn Keel.
- Guided first summon: guarantees one of Mira Solace, Toma Brask, Iri Quill, or Edda Rune.
- First special battle reward: Oren Thatch at 4-star.
- First premium banner focus: Selene Voss, Kaito Renn, Nyx Calder, and Vela Nadir.

Roster guardrails:

- MVP must include at least four melee heroes and four ranged heroes.
- MVP must include at least four physical attackers, four magical attackers, and one hybrid attacker.
- At least one healer/support must be available below 5-star rarity.
- No basic role should require pulling a premium 5-star hero.
- Premium heroes should feel special because of expressive skill kits, animation quality, and team-building options, not because they are the only answer to a required mechanic.

## Element and Weapon Triangle

Use original element labels instead of Fire Emblem colors:

- Solar beats Verdant.
- Verdant beats Lunar.
- Lunar beats Solar.
- Neutral has no triangle advantage or disadvantage.

UI may still use distinct colors, but every advantage indicator must also include iconography for accessibility.

Weapon examples:

- Solar: blades, fire tomes, heavy lances.
- Lunar: spears, ice tomes, precision bows.
- Verdant: axes, nature tomes, beasts.
- Neutral: daggers, staves, devices, colorless bows.

## Skill System

Each hero can equip:

- Weapon skill.
- Assist skill.
- Special skill.
- Passive A.
- Passive B.
- Passive C.
- Seal/accessory.

Skill triggers:

- Start of turn.
- Start of combat.
- Before unit attacks.
- Before foe attacks.
- After combat.
- On special trigger.
- On movement.
- On ally proximity.
- On HP threshold.

Effects:

- Stat buffs/debuffs.
- True damage.
- Damage reduction.
- Healing.
- Cooldown changes.
- Extra movement.
- Follow-up grant/deny.
- Counterattack changes.
- Status effects.
- Terrain creation/removal.

## Shop Design

Shop currency: **Credits**.

Current development behavior:

- Players can claim credit packs from the shop for free.
- Players may claim any number of free credit packs.
- There is no real-money checkout in the current build plan.
- The shop must not sell individual heroes directly.
- Credits are spent only on hero packs/summon sessions for now.
- Credit grants and spends should still be written to an economy ledger so the system is ready for paid purchase validation later.

Initial free credit packs:

| Pack | Credits | Cost |
| --- | ---: | ---: |
| Small Credit Pack | 20 | Free |
| Medium Credit Pack | 100 | Free |
| Large Credit Pack | 500 | Free |

Future production behavior:

- Credit packs may become real-money in-app purchases.
- Paid and free credits must be tracked separately if platform policy requires it.
- Refunds, failed purchases, parental controls, regional limits, and receipt validation must be handled before launch.
- Direct hero purchases remain disallowed unless the game design is intentionally changed later.

## Summoning Design

Summoning currency: **Credits**.

Session flow:

1. Player chooses a banner.
2. Server creates a summon session with five colored crystals.
3. Player chooses one crystal.
4. Server reveals hero and records result.
5. Player may keep pulling discounted crystals from the same session.

Cost:

| Pull in Session | Cost |
| ---: | ---: |
| 1 | 5 Credits |
| 2 | 4 Credits |
| 3 | 4 Credits |
| 4 | 4 Credits |
| 5 | 3 Credits |

Standard rates:

| Pool | Rate |
| --- | ---: |
| 5-star focus | 3.0% |
| 5-star standard | 3.0% |
| 4-star | 58.0% |
| 3-star | 36.0% |

Pity:

- Each banner tracks pity independently.
- Every 5 summons without any 5-star increases total 5-star rate by +0.5 percentage points.
- Increase is split between focus and standard 5-star pools.
- Any 5-star resets the pity counter.

Spark:

- Eligible banners grant one focus hero selection after 40 summons.
- Spark progress and eligibility must be visible before summoning.

Focus protection:

- Optional later system: after repeated non-focus 5-star pulls, the next 5-star result is guaranteed to be focus.
- This must be disclosed and server-tracked per banner.

Compliance:

- Show complete pool and odds.
- Keep paid and free currency ledgers.
- Validate purchases server-side.
- Support purchase limits and regional disclosure rules.
- Never list individual heroes as direct shop purchases.

## Economy

Currencies and materials:

- Credits: shop currency used to open hero packs/summon sessions. In the current development build, players can claim unlimited credits for free.
- Gold: common upgrade currency.
- Hero Feathers equivalent: promotion material from quests, arena, dismissals, and events.
- Skill Scrolls: skill unlock material.
- Badges: color/element promotion material.
- Arena Medals: weekly competitive rewards.
- Event Tokens: limited event-shop currency for materials, cosmetics, and shards, not direct hero purchases.
- Stamina: PvE energy.
- Duel Crests: arena entry resource.

Economy principles:

- In development, all players can claim unlimited free credits from the shop for testing hero packs.
- In production, a free player should be able to summon regularly through story, quests, events, and arena.
- Future paid spend may accelerate collection, not tactical decision-making inside battle.
- Individual heroes are earned through summoning, event recruitment, story rewards, or future shard systems, not direct shop purchase.
- Keep new-player rewards generous but finite.
- Avoid making rare duplicates mandatory for basic viability.
- Older heroes need periodic refinement paths.

## Game Modes

### Story

- Chapters contain 5 maps each.
- Normal, Hard, and Lunatic difficulties.
- First-clear rewards include Credits.
- Story introduces terrain, assists, specials, movement types, and status effects gradually.

### Training Tower

- Repeatable EXP/material maps.
- Enemy teams and terrain rotate daily.
- Difficulty floors consume more stamina and grant better rewards.

### Special Battles

- Limited-time hero recruitment maps.
- Challenge maps with unique objectives.
- Reward maps for anniversaries, holidays, and campaigns.

### Arena

- Asynchronous PvP.
- Players set defense teams.
- Attackers fight AI-controlled snapshots.
- Weekly seasons with bonus heroes.
- Chain bonus up to 5 wins.
- Rewards based on high score, rank tier, and defense result.

### Quests

- Daily: simple activity.
- Weekly: mode variety.
- Event: limited objectives.
- Tutorial: onboarding and feature discovery.
- Hero mastery: encourage using specific roles without requiring rare units.

## Technical Architecture

Backend choice:

- Language: TypeScript.
- Framework: NestJS.
- Primary database: PostgreSQL.
- Supporting store: Redis.
- API style: REST first with OpenAPI documentation.
- ORM/query layer: Prisma or Drizzle.

Why this stack:

- TypeScript keeps API contracts, content schemas, and admin tools strongly typed.
- NestJS gives a clean module structure for shop, wallet, summon, inventory, battle, quest, and arena systems.
- PostgreSQL is the source of truth for transactional game state: credits, ledgers, inventory, pity, quests, and arena results.
- Redis is for short-lived operational state such as rate limits, idempotency locks, summon-session cache, arena opponent cache, queues, and temporary leaderboards.
- The MVP should be a modular monolith. Split services later only when traffic, deployment, or team boundaries justify it.

Client modules:

- Battle rules.
- Battle presentation.
- Hero collection.
- Shop UI.
- Summoning UI.
- Inventory/economy UI.
- Quest UI.
- Arena UI.
- Content loader.
- Asset/addressable loader.
- Analytics.
- Local cache.

Server modules:

- Auth/session.
- Player state.
- Wallet and credit ledger.
- Shop catalog and credit pack claims.
- Purchase receipt validation.
- Summon sessions.
- Banner/pity/spark state.
- Content manifest.
- Quest progress.
- Battle validation.
- Arena matchmaking/scoring.
- Live event scheduler.
- Remote config.

Recommended NestJS modules:

- `AuthModule`: guest sessions, platform login linking, token refresh.
- `PlayerModule`: profile, tutorial state, settings, cloud save metadata.
- `WalletModule`: credit balances, grants, spends, immutable ledger entries.
- `ShopModule`: shop catalog, free credit claims, future paid credit packs.
- `SummonModule`: summon sessions, hero pack pulls, pity, spark, summon history.
- `InventoryModule`: hero instances, merges, materials, equipment.
- `BattleModule`: battle start/completion, replay validation, reward grants.
- `QuestModule`: quest progress and reward claims.
- `ArenaModule`: defense snapshots, opponent selection, scoring, season rewards.
- `ContentModule`: versioned content manifest for heroes, skills, maps, banners, events.

Shared modules:

- Data schemas.
- Combat simulator.
- Summon odds simulator.
- Content validation.
- Generated client/server constants.

## Data Model Overview

HeroDefinition:

- id
- nameKey
- titleKey
- faction
- element
- weaponType
- moveType
- damageType
- rarityAvailability
- baseStats
- growths
- skill slots
- asset keys
- voice keys
- tags

SkillDefinition:

- id
- nameKey
- descriptionKey
- slot
- allowedWeaponTypes
- allowedMoveTypes
- cooldown
- triggers
- conditions
- effects
- inheritance rules

BannerDefinition:

- id
- nameKey
- startAt
- endAt
- pools
- rates
- focusHeroIds
- pityRules
- sparkRules
- crystalColorRules
- freePullRules

MapDefinition:

- id
- size
- terrain grid
- player spawns
- enemy units
- objective
- turn limit
- rewards
- dialogue hooks

PlayerHero:

- instanceId
- heroDefinitionId
- rarity
- level
- exp
- merges
- asset/flaw or stat variant
- unlockedSkills
- equippedSkills
- favorite flag
- obtainedAt

Backend database tables:

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

Database rules:

- PostgreSQL is authoritative for credits, heroes, materials, summon results, purchases, and rewards.
- Redis data must be disposable and recoverable from PostgreSQL or content configuration.
- Every credit grant or spend must create an immutable `credit_ledger_entries` row.
- Shop credit claims and hero pack pulls must use database transactions.
- Use idempotency keys for shop claims, summon pulls, purchase validation, and reward claims.

## API Plan

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
POST /v1/quests/claim
```

## Content Pipeline

Content should be authored in structured data and validated before build:

- Heroes, skills, maps, banners, quests, events, rewards, and shop items are data.
- Validation catches missing localization, invalid hero ids, invalid skill slots, unreachable map tiles, impossible rewards, expired event references, and unsafe gacha rates.
- Generated outputs feed both client and server to avoid drift.
- Balance simulation runs before content release.

Required tools:

- Battle simulator.
- Summon odds simulator.
- Economy projection spreadsheet or script.
- Content linter.
- Localization completeness checker.
- Asset reference checker.

## Art Requirements

Minimum MVP asset set:

- 12 playable heroes with portraits and battle sprites.
- 8 enemy variants.
- 3 environment tile sets.
- 1 home background.
- 1 summon background and reveal animation.
- UI icons for all resources, elements, weapon types, movement types, statuses, and menu tabs.
- Basic attack, hit, heal, buff, debuff, defeat, summon, and reward SFX.
- 3 music loops: home, battle, summon/result.

Style:

- Clear silhouettes.
- High contrast tactical readability.
- Portraits should feel premium and collectible.
- Battle sprites should be expressive but readable at small size.
- UI should be calm, quick to scan, and built for repeated daily use.

## Accessibility

- Colorblind-safe element indicators.
- Icon plus color for all advantages and statuses.
- Scalable text.
- Reduced motion option.
- Disable screen shake option.
- Combat forecast text that explains fatal damage and follow-ups.
- Captions/subtitles for voiced story.
- One-handed portrait controls.

## Analytics

Track:

- Tutorial completion.
- Battle starts/completions/failures.
- Map retries.
- Summon starts, pulls, pity progress, spark use.
- Currency earns/spends.
- Hero upgrades.
- Quest claims.
- Arena attempts, chain length, score, rank.
- Session length and retention.
- Crash/error context.

Do not track unnecessary personal data.

## QA Plan

Automated:

- Combat formula unit tests.
- Skill trigger tests.
- Pathfinding tests.
- AI deterministic replay tests.
- Summon probability simulation tests.
- Economy ledger tests.
- Receipt validation tests with sandbox receipts.
- Content validation tests.

Manual:

- Tutorial on low-end Android and older iPhone targets.
- Summon flow with insufficient currency, full inventory, pity, spark, and free pulls.
- Battle UI on tall, small, and tablet aspect ratios.
- Offline/poor-network recovery.
- Account restore.
- Refund and failed purchase handling.
- Arena season rollover.

## Milestones

### Milestone 0: Prototype

- Grid renderer.
- Movement/pathfinding.
- Combat forecast.
- Basic AI.
- Four sample heroes.
- One test map.

### Milestone 1: Vertical Slice

- Unity project initialized.
- Home, roster, team edit, battle, reward flow.
- 8 heroes, 10 skills, 5 maps.
- Local-only summon simulator.
- First content schema and validator.

### Milestone 2: Server Economy

- Auth/cloud save.
- Inventory ledger.
- Server-authoritative summoning.
- Banners, pity, spark.
- Purchase sandbox validation.

### Milestone 3: MVP Content

- 12 playable heroes.
- 15 story maps.
- Training tower.
- Special battle.
- Arena snapshot PvP.
- Daily/weekly quests.

### Milestone 4: Soft Launch

- Analytics dashboards.
- Economy tuning.
- Crash reporting.
- Store compliance review.
- Regional configuration.
- LiveOps calendar for first 8 weeks.

### Milestone 5: Global Launch

- Final App Store and Google Play builds.
- Launch banners and events.
- Customer support flows.
- Account deletion/export.
- Emergency remote config and kill-switch plan.

## Current Web Prototype

The repository now includes a runnable offline web prototype built with Vite, React, and TypeScript.

Implemented:

- Anime-fantasy mobile-first UI.
- Mobile-app shell with compact resource header, scrollable content area, and bottom navigation.
- UI treatment inspired by mobile tactical RPGs and Fire Emblem Heroes interaction density, while using original art, terminology, and layout.
- Generated anime-style portrait assets for all 12 original heroes.
- Free credit shop with unlimited development credit claims.
- 5-hero pack opening using the original starter roster.
- Hero roster display with rarity, element, range, and damage type.
- Offline player-vs-CPU 6x8 tactical battle with alternating one-unit turns.
- Player selects one hero per turn to move and then attack or wait; CPU then acts with one unit and returns control to the player.
- Battle ends when all heroes on one side are defeated.
- Selected-unit battle stats for HP, Atk, Spd, Def, Res, range, and movement.
- Fantasy arena terrain visuals with roads, forests, water, wall tiles, and ward tiles.
- Roster cards, summon reveals, selected-unit panels, and battle board tokens all use the generated hero portraits.
- Local persistence through `localStorage`.
- `localGameService` abstraction that can later be replaced with backend API calls.

Run locally:

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

Build check:

```bash
npm run build
```

Prototype files:

- `src/App.tsx`: main UI and screen flow.
- `src/styles.css`: responsive anime-fantasy interface styling.
- `src/game/data.ts`: original hero roster, shop packs, and summon constants.
- `src/game/types.ts`: shared game/domain types.
- `src/game/localGameService.ts`: offline shop, summon, roster, battle, and persistence logic.
- `public/assets/heroes/`: generated hero portrait PNG assets and the source portrait atlas.
- `artifacts/`: visual QA screenshots from browser checks.

Verification artifacts:

- `artifacts/prototype-mobile.png`
- `artifacts/prototype-desktop.png`
- `artifacts/prototype-battle-updated-mobile.png`
- `artifacts/prototype-anime-assets-mobile.png`
- `artifacts/mobile-app-ui-home-v2.png`
- `artifacts/mobile-app-ui-battle-v2.png`
- `artifacts/mobile-app-ui-mobile-home.png`
- `artifacts/mobile-app-ui-mobile-battle.png`
- `artifacts/mobile-app-ui-desktop-home.png`
- `artifacts/mobile-app-ui-desktop-battle.png`

Hero assets:

- `public/assets/heroes/aria-vale.png`
- `public/assets/heroes/bronn-keel.png`
- `public/assets/heroes/selene-voss.png`
- `public/assets/heroes/kaito-renn.png`
- `public/assets/heroes/mira-solace.png`
- `public/assets/heroes/nyx-calder.png`
- `public/assets/heroes/toma-brask.png`
- `public/assets/heroes/iri-quill.png`
- `public/assets/heroes/oren-thatch.png`
- `public/assets/heroes/vela-nadir.png`
- `public/assets/heroes/cass-rook.png`
- `public/assets/heroes/edda-rune.png`

Next recommended step: improve battle depth with terrain, skill effects, combat forecast, and a simple team-selection screen before connecting the service layer to NestJS APIs.
