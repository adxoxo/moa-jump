# ASSETS.md — MOA JUMP
# Complete Art Asset List for the Artist

All assets go in the `/assets/` folder.
Game canvas is **420px wide × 680px tall**.
Style: **chibi, meme-friendly, slightly exaggerated expressions**.
Palette: dark backgrounds, vivid character colors, glowy platform highlights.

---

## 1. Characters — `/assets/characters/`

Five characters. Each is a **sprite sheet PNG**.
Frame size: **64px wide × 80px tall**.
Frames per sheet: **6 frames** laid out horizontally (384px × 80px total).

| Frame | Animation | Description |
|-------|-----------|-------------|
| 0–3 | `idle` | Slight up-down bob. Frame 0 = neutral, 1 = slightly up, 2 = peak bob, 3 = back down |
| 4 | `jump_launch` | Squashed horizontally (wider, shorter). Big grin or determined face. |
| 5 | `jump_air` | Stretched vertically (taller, narrower). Hair/ears flying up. |

**No hurt frame needed** — hurt state uses a red tint overlay in code.

### Character Designs

#### `character_mage.png` — The Mage
- Color: **Blue** (#3b82f6)
- Animal/creature: **Wolf or cat with wizard hat**
- Outfit: Flowing robe, star patterns, oversized sleeves
- Expression: Tired but dramatic. Half-lidded eyes. Always looks like he's about to monologue.
- Accessories: Small magic wand, crescent moon earring
- Personality visual cue: Slightly dark circles under eyes (stays up too late gaming/casting spells)

#### `character_bard.png` — The Bard
- Color: **Purple** (#a855f7)
- Animal/creature: **Tall lanky rabbit**
- Outfit: Flowing purple coat, turtleneck, aesthetic scarf
- Expression: Calm, slightly awkward smile. Big ears slightly droopy.
- Accessories: Small lute or guitar strapped to back
- Personality visual cue: Legs slightly too long for body (tall energy)

#### `character_jester.png` — The Jester
- Color: **Orange** (#f97316)
- Animal/creature: **Fox with jester hat or curly horns**
- Outfit: Mismatched fun outfit, asymmetric, patterned
- Expression: Wide chaotic grin, one eye slightly bigger than the other
- Accessories: Small bell on hat, confetti always floating around
- Personality visual cue: Always mid-laugh or mid-prank expression

#### `character_knight.png` — The Knight
- Color: **Pink** (#ec4899)
- Animal/creature: **Cat or bear in light armor**
- Outfit: Cute pink armor, pauldrons, tiny cape
- Expression: Serious intense face but with cute proportions. Furrowed brows.
- Accessories: Small sword on hip, abs visible (canon lore: loves working out)
- Personality visual cue: Flex pose in idle frames

#### `character_sage.png` — The Sage
- Color: **Cyan** (#22d3ee)
- Animal/creature: **Bunny or cat with long bangs covering one eye**
- Outfit: Cozy oversized hoodie with emoji patches
- Expression: Shy smile, one eye hidden by hair, soft and gentle
- Accessories: Hoodie strings, small star hair clip
- Personality visual cue: Slightly hunched, hiding energy

---

## 2. Backgrounds — `/assets/backgrounds/`

Each zone has **2 layers** for parallax scrolling.
- **Layer A (far):** Scrolls at 0.15x speed. Wide scenery, sky, distant elements.
- **Layer B (mid):** Scrolls at 0.35x speed. Closer details, decorative elements.

Both layers: **420px wide**. Height: **680px minimum, tileable vertically**.
Export as PNG with transparency where possible.

### Zone 0 — The Real World
**`bg_zone0_far.png`**
- Blue-to-navy gradient sky
- Distant city skyline silhouette (low detail, dark shapes)
- Clouds (3–4 fluffy white/light blue clouds scattered)
- Faint stars beginning to appear at top

**`bg_zone0_mid.png`**
- School building rooftop elements: water tank, AC units, metal railing
- Hanging laundry or small potted plants on ledges
- Birds (silhouettes) in the distance
- Chain-link fence segments

---

### Zone 1 — The Chaos
**`bg_zone1_far.png`**
- Deep purple/violet gradient sky
- Glitchy pixel corruption artifacts along edges (like a broken screen)
- Upside-down or floating city elements in background
- Pastel color blobs (soft, dreamlike, not harsh)
- Scattered small stars that are wrong colors (pink, green, orange)

**`bg_zone1_mid.png`**
- Floating broken platform chunks (not interactive, just decorative)
- Giant glowing question marks or exclamation marks floating
- Cartoon crying/laughing emoji faces subtly in background (small, not distracting)
- Wavy distortion lines across the midground

---

### Zone 2 — The Star
**`bg_zone2_far.png`**
- Near-black deep space
- Dense star field (many small dots, varied brightness)
- Nebula cloud in purple/pink/blue tones (soft, not harsh)
- Distant planet silhouette (one or two, simple shapes)
- Constellation line art (faint dotted lines connecting stars)

**`bg_zone2_mid.png`**
- Floating asteroids and space rocks (irregular shapes, no interaction)
- Small satellite or space probe silhouettes
- Comet streak trails
- Glowing star clusters
- At the very top: a large shining star (the goal — "the star" the characters are jumping toward)

---

## 3. Platforms — `/assets/platforms/`

Each platform: **varies in width (70–110px), 13px tall**.
Draw at **110px wide** — code scales down as needed.
Export as PNG with transparent background.

| File | Zone | Type | Description |
|------|------|------|-------------|
| `platform_z0_normal.png` | Zone 0 | Normal | Concrete rooftop ledge. Rough texture, maybe moss. |
| `platform_z0_moving.png` | Zone 0 | Moving | Rolling AC unit or wheeled crate on a ledge. |
| `platform_z0_spring.png` | Zone 0 | Spring | Rooftop trampoline or bounce mat. Green, with spring coils on top. |
| `platform_z0_break.png` | Zone 0 | Break | Cracked concrete slab. Visible stress fractures. Red tinge. |
| `platform_z1_normal.png` | Zone 1 | Normal | Glowing dream tile. Soft pastel with inner glow. |
| `platform_z1_moving.png` | Zone 1 | Moving | Floating broken glass shard. Sharp edges, iridescent. |
| `platform_z1_spring.png` | Zone 1 | Spring | Giant mushroom cap. Purple spotted, springy look. |
| `platform_z1_break.png` | Zone 1 | Break | Glitch block. Pixelated edges, looks corrupted. |
| `platform_z2_normal.png` | Zone 2 | Normal | Asteroid chunk. Rocky, grey-brown, slightly glowing edges. |
| `platform_z2_moving.png` | Zone 2 | Moving | Satellite dish or solar panel. Mechanical look. |
| `platform_z2_spring.png` | Zone 2 | Spring | Rocket launch pad. Small rocket booster visible on top. |
| `platform_z2_break.png` | Zone 2 | Break | Crumbling meteor. Already falling apart look. |

---

## 4. Enemies — `/assets/enemies/`

All enemies: single PNG, no animation needed (code handles movement).
Draw at the sizes below with transparent background.
**Meme energy is the goal — exaggerated, funny, instantly readable at small sizes.**

---

### Zone 0 — The Real World (passive/funny)

| File | Size | Behavior in code | Description |
|------|------|-----------------|-------------|
| `enemy_pigeon.png` | 32×24px | Passive drift on platform | Fat round pigeon. Slightly grumpy expression. Classic grey/white. Bread crumbs around it. |
| `enemy_company_building.png` | 48×56px | Slowly descends from top, tries to squash player | Tiny corporate office building. "THE COMPANY" written on it in stiff corporate font. Blank windows. Slightly evil aura. No real logos — just generic brutal architecture vibes. |
| `enemy_sasaeng.png` | 28×34px | Drifts side to side, proximity flash stuns player briefly | Tiny paparazzi figure. Comically oversized camera covering their whole face. Camera flash effect radiates outward when near player. Trenchcoat. Very sneaky posture. |
| `enemy_schedule.png` | 40×30px | Flies horizontally across screen | Floating wall calendar / schedule board. Packed with tiny illegible text and dates. Has a tired/overwhelmed face drawn on it. If it hits you your character looks exhausted. |

---

### Zone 1 — The Chaos (mixed, weirder)

| File | Size | Behavior in code | Description |
|------|------|-----------------|-------------|
| `enemy_manager.png` | 30×38px | Slow horizontal chase toward player X | Suited figure in all black with a clipboard. Stern frown. Tiny earpiece. Speech bubble above head says "SCHEDULE." Slow but persistent. |
| `enemy_bad_review.png` | 34×28px | Homes in on player from above | Floating card/phone screen showing a giant ★☆☆☆☆ one-star rating. Angry face on the card. Wobbles as it flies toward you. |
| `enemy_fan_wave.png` | 420×28px | Sweeps full width horizontally, one direction | A dense horizontal wave of tiny screaming chibi fans. Little arms raised, mouths open, hearts and exclamation marks floating above them. Sweeps the whole screen — duck or die. |

---

### Zone 2 — The Star (active, most dangerous)

| File | Size | Behavior in code | Description |
|------|------|-----------------|-------------|
| `enemy_rival_ship.png` | 52×32px | Flies across screen, fires slow projectiles | Spaceship with "NOT TXT" written on the side (fictional rival group). Fires small star-shaped slow shots. Retro sci-fi look, slightly goofy design. |
| `enemy_cease_desist.png` | 38×44px | Fast diagonal flyer, bounces off walls | A literal legal document flying through space. "CEASE & DESIST" in big bold letters on the front. Little wings on the sides. Angry red stamp mark. The most meta enemy in the game. |
| `enemy_antifan_meteor.png` | 44×44px | Fast diagonal crash, spawns from top | Dark angry meteor with a tiny rage face drawn on it. Furrowed brows, gritted teeth. Glowing red angry aura. Cracks on surface like it's already furious. |
| `enemy_blackhole.png` | 48×48px | Stationary, pulls player sideways within 90px | Swirling dark vortex. Deep purple-black with glowing rim. Pulsing look. Add tiny sad faces getting sucked in around the edges for comedy. |

---

## 5. UI — `/assets/ui/`

| File | Size | Description |
|------|------|-------------|
| `logo_moajump.png` | 300×80px | "MOA JUMP" game logo. Bold, fun, stars around it. |
| `btn_play.png` | 200×56px | Purple rounded button. "PLAY" text already on it. |
| `btn_play_hover.png` | 200×56px | Same but slightly brighter/glowing. |
| `card_bg.png` | 76×108px | Character card background. Dark purple, rounded corners, subtle border. |
| `card_selected.png` | 76×108px | Same but with glowing purple border highlight. |
| `win_star.png` | 120×120px | Big shining star graphic for win screen. Gold/yellow, sparkle rays. |
| `zone_badge_0.png` | 100×28px | "The Real World" zone badge. Blue tones. |
| `zone_badge_1.png` | 100×28px | "The Chaos" zone badge. Purple/glitch tones. |
| `zone_badge_2.png` | 100×28px | "The Star" zone badge. Gold/space tones. |

---

## 6. Particles — `/assets/particles/`

Small sprites used for particle emitters. All tiny, transparent background.

| File | Size | Description |
|------|------|-------------|
| `particle_dust.png` | 8×8px | Small soft circle. Off-white. Zone 0 ambient dust. |
| `particle_glitch.png` | 6×6px | Pixel square with slight corruption. Pink/purple. Zone 1. |
| `particle_star.png` | 10×10px | Small 4-point star. Gold/white. Zone 2 trail. |
| `particle_confetti_1.png` | 8×6px | Small rectangle confetti piece. Use multiple tints in code. |
| `particle_confetti_2.png` | 6×8px | Small square confetti piece. |

---

## 7. Audio (Sourced Separately) — `/assets/audio/`

Your sister doesn't need to make these. Source royalty-free:
- **Recommended:** freesound.org, pixabay.com/music, incompetech.com

| File | Vibe |
|------|------|
| `zone0_bgm.mp3` | Upbeat, cheerful, city pop feel. ~120 BPM. |
| `zone1_bgm.mp3` | Glitchy, lo-fi, dreamlike. Slightly chaotic. ~100 BPM. |
| `zone2_bgm.mp3` | Epic, spacey, building tension. Synth heavy. ~130 BPM. |
| `jump.mp3` | Short boing/spring sound. |
| `land.mp3` | Soft thud. Very short. |
| `hurt.mp3` | Cartoon ow sound. Short. |
| `spring.mp3` | Big boing, higher pitched than jump. |
| `win.mp3` | Victory fanfare. 2–3 seconds. |
| `zone_transition.mp3` | Whoosh/glitch sound. 1 second. |

---

## Export Checklist for Artist

- [ ] All PNGs exported with **transparent backgrounds** (except full backgrounds)
- [ ] Character sprite sheets: 6 frames horizontal, 64×80px each frame
- [ ] Backgrounds: 420px wide, at minimum 680px tall, vertically tileable
- [ ] No anti-aliasing fringing on transparent edges (use "trim alpha" on export)
- [ ] File names match exactly as listed above (lowercase, underscores)
- [ ] Place all files in the correct `/assets/subfolder/` as listed
- [ ] No real member names, no PPULBATU names, no HYBE/TXT logos anywhere in art
