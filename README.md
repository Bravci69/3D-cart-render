# 🎴 CardCatcher 3D Render Engine

Vysoko optimalizovaný 3D a galériový produktový engine pre e-shopy (primárne **WordPress / WooCommerce** cez REST API alebo Basic SQL), ktorý podľa názvov produktov v databáze **automaticky vyhľadá reálne obrázky na internete**, pripraví optimalizované WebP textúry a ponúkne zákazníkovi **prepínač medzi fotkami produktu a interaktívnym 3D modelom**.

Pripravené pre viacero kartových hier:
- **Pokémon TCG** (EN aj DE verzie – Sword & Shield, Scarlet & Violet, Mega Evolution, Classic Vintage)
- **Magic: The Gathering** (`Scryfall` + Web Image Search)
- **One Piece Card Game** (`OPTCG API` + Web Image Search)
- **League of Legends (Riftbound)** & ďalšie TCG formáty

---

## ⚡ Hlavné funkcie

- **Prepínač Fotky ↔ 3D Render (`ProductMediaView`):** Po otvorení produktu sa predvolene zobrazí 2D fotogaléria produktu (všetky dohľadané uhly a zoom) a jedným kliknutím sa používateľ prepne na interaktívny 360° 3D model.
- **Automatický backend na hľadanie obrázkov (`server/`):**
  - Z názvu produktu rozpozná kartovú hru, jazykovú verziu (`EN` / `DE` / `JP`) aj typ balenia (`booster-pack`, `booster-box`, `booster-bundle`, `elite-trainer-box`, `tin`, `mini-tin`, `blister-pack`, `collection-box`, `build-and-battle`, `starter-deck`).
  - Stiahne oficiálne packshoty (`ptcg-assets`, `jwkeena`) aj webové fotografie a cez **Sharp** oreže prázdne okraje, prispôsobí proporcie boxu a vytvorí ľahké WebP textúry.
- **WordPress / WooCommerce & Basic SQL synchronizácia (`POST /api/sync/wordpress`):**
  - **WooCommerce REST API / Store API** (`wp-json/wc/v3/products` alebo `wc/store/v1/products`)
  - **Priamy Basic MySQL SQL dopyt** (`mysql2` na `wp_posts` / `wp_postmeta` – schéma v `server/db/schema.sql`)
  - **WordPress Plugin (`wordpress/cardcatcher-3d-viewer.php`):** Shortcode `[cardcatcher_3d]` a automatické vloženie prepínača na produktovú stránku WooCommerce.
- **Katalóg 71 reálnych produktov:** Vrátane oboch verzií **Evolving Skies ETB** (`[Flareon/Jolteon/Umbreon/Leafeon]` aj `[Vaporeon/Espeon/Glaceon/Sylveon]`), Surging Sparks, Prismatic Evolutions, Destined Rivals, Black Bolt / White Flare, Mega Evolution (EN/DE), One Piece, Magic aj Riftbound.

---

## 🚀 Rýchly štart

```bash
# 1. Inštalácia závislostí
npm install

# 2. Spustenie frontendu (Vite :5173) aj backend API (:3001) naraz
npm run dev:full
```

Otvorte `http://localhost:5173`.

### Regenerácia alebo doplnenie katalógu
```bash
# Celý katalóg (71 produktov)
npm run sync:catalog

# Alebo iba vybraný set podľa názvu:
npx tsx scripts/sync-catalog.ts --filter="Evolving Skies"
```

---

## 🔌 WordPress / WooCommerce Integrácia

1. Nahrajte súbor `wordpress/cardcatcher-3d-viewer.php` do `wp-content/plugins/` a aktivujte plugin vo WordPresse (prípadne použite shortcode `[cardcatcher_3d]`).
2. Alebo vložte priamo do HTML šablóny produktu:

```html
<div
  data-cardcatcher-3d
  data-api-url="https://api.vas-web.sk/api"
  data-product-name="Evolving Skies Elite Trainer Box [Flareon/Jolteon/Umbreon/Leafeon]"
  data-default-view="images"
  data-height="520px">
</div>
<script src="/dist/lib/cardcatcher-3d.umd.js"></script>
```

---

## 🛠️ Produkčný build

```bash
# Web aplikácia (dist/)
npm run build

# Standalone embed knižnica pre WordPress (dist/lib/cardcatcher-3d.umd.js & .es.js)
npm run build:lib
```
