# 🎴 CardCatcher 3D Render Engine

Vysoko optimalizovaný 3D renderovací systém pre **reálne Pokémon balíčky (booster packs)**, **booster boxy**, **Elite Trainer Boxy (ETB)**, **plechovky (tins)** a **blister balenia** s reálnymi fotografiami stiahnutými z webu.

Namiesto sťahovania 10–20 MB `.glb` súborov systém generuje 3D geometriu priamo v prehliadači cez **Three.js / React Three Fiber** a mapuje na ňu **ultra-ľahké WebP textúry (~110 KB na celý produkt)** s realistickým metalickým, holografickým a fóliovým leskom (`MeshPhysicalMaterial` s `clearcoat: 1.0` a `iridescence: 0.85`).

---

## 📸 Reálne voľne dostupné produkty v projekte

Všetky textúry boli stiahnuté a optimalizované z verejne dostupných repozitárov a oficiálnych packshotov:

1. **Pokémon 151 Booster Pack (Mew)** – Scarlet & Violet 151 originálny fóliový obal
2. **Obsidian Flames Booster (Charizard ex)** – originálny Tera Charizard balíček
3. **Surging Sparks Booster (Stellar Pikachu)** – najnovší Stellar Pikachu booster obal
4. **1999 Base Set Booster (Vintage Charizard)** – pôvodný retro obal z roku 1999
5. **Obsidian Flames 36-Booster Display Box** – kompletný 3D zapečatený box
6. **Pokémon 151 Elite Trainer Box (Snorlax)** – ETB zberateľská krabica
7. **Crown Zenith Elite Trainer Box (Lucario VSTAR)** – ETB formát
8. **Crown Zenith Triple Blister Pack** – trojitý blister s promo kartou

Ak chcete kedykoľvek stiahnuť čerstvé reálne obrázky z webu:
```bash
npm run download:real
```

---

## ⚡ Hlavné funkcie a výhody

- **Ultra-rýchle načítanie:** Nulový layout shift (CLS), assety < 120 KB na produkt.
- **Fóliový a metalický odlesk:** Presná simulácia zberateľských balíčkov s nastaviteľným `clearcoat`, `roughness` a `metalness`.
- **Click-to-3D Lazy Loading:** Na webe sa štandardne zobrazí statický optimalizovaný 2D obrázok. 3D WebGL kontext sa inicializuje až po kliknutí používateľa.
- **Smart Database Mapping:** Funkcia `matchByName()` automaticky rozpozná typ produktu (napr. "booster", "box", "etb", "tin") z vašej databázy alebo e-shopu a nastaví správne rozmery a fyzikálne vlastnosti materiálu.
- **Jednoduchý Embed:** Možnosť vložiť do akéhokoľvek webu (WordPress, WooCommerce, Shoptet, vlastný PHP/HTML e-shop) cez `<div data-cardcatcher-3d>` a 1 `<script>` tag.
- **WebGPU a WebGL 2 podpora:** Automatická adaptácia na zariadenie, obmedzenie pixel ratia na max 2 pre úsporu batérie mobilov.

---

## 🚀 Rýchly štart

### 1. Inštalácia a spustenie demo servera

```bash
# Inštalácia závislostí
npm install

# Vygenerovanie optimalizovaných vzorových textúr a katalógu
npm run generate:assets

# Spustenie vývojového servera
npm run dev
```

Otvorte v prehliadači `http://localhost:5173`.

---

## 📦 Typy Pokémon produktov a rozmery

Systém má predkonfigurované profily pre všetky kľúčové typy balení v `src/config/product-types.ts`:

| Typ | Rozmery (Š × V × H) | Bevel | Vlastnosti materiálu |
| :--- | :--- | :--- | :--- |
| **`booster-pack`** | 2.1 × 3.3 × 0.15 | 0.03 | Fólia, vysoký clearcoat (0.85), jemný kovový lesk |
| **`booster-box`** | 3.5 × 2.8 × 2.2 | 0.05 | Matný kartón, 36 balíčkov, nízky odlesk |
| **`elite-trainer-box`** | 3.2 × 3.4 × 1.9 | 0.06 | Hrubý polomatný zberateľský box, clearcoat 0.5 |
| **`tin`** | 2.6 × 3.2 × 1.4 | 0.15 | Vysoký kovový lesk (metalness 0.85, roughness 0.15) |
| **`blister-pack`** | 2.5 × 4.1 × 0.3 | 0.04 | Priesvitný plast + potlačený kartón |
| **`collection-box`** | 4.2 × 3.0 × 1.1 | 0.06 | Široký darčekový formát |

---

## 🔌 Integrácia s vlastnou databázou / E-shopom

### Možnosť A: Vloženie do existujúceho webu (Embed skript)

Do šablóny detailu produktu vložte:

```html
<!-- Kontajner pre 3D render (z vášho CMS vložte dynamický názov produktu) -->
<div 
  data-cardcatcher-3d
  data-product-name="Pokémon Scarlet & Violet 151 Booster Pack">
</div>

<!-- Knižnica CardCatcher (stačí vložiť pred </body>) -->
<script src="https://vas-web.sk/dist/lib/cardcatcher-3d.umd.js"></script>
```

### Možnosť B: Použitie cez React komponent

```tsx
import { ProductViewer, ProductDisplay, productService } from 'cardcatcher-3d'

// 1. Získanie konfigurácie podľa názvu z vašej DB
const product = await productService.matchByName("Obsidian Flames Booster Box");

// 2. Vykreslenie interaktívneho 3D modelu
function ProductPage() {
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <ProductViewer product={product} autoRotate={true} />
    </div>
  )
}
```

### Možnosť C: REST API napojenie

V `src/config/integration.ts` alebo cez `.env` nastavte:

```env
VITE_API_BASE_URL=https://api.vas-eshop.sk/v1
VITE_API_KEY=vas_api_token
```

---

## 🎨 Spracovanie nových fotografií (Image Pipeline)

Ak máte vlastné fotografie nových Pokémon balíčkov:

1. Uložte fotografie do priečinka: `raw-images/<nazov-produktu>/`
2. Spustite optimalizačný skript:
   ```bash
   npm run process:textures
   ```
3. Skript cez **Sharp** automaticky:
   - Zmenší obrázok na webovú textúru (1024×1024 max)
   - Prekonvertuje formát na úsporný **WebP (quality 85–90)**
   - Vytvorí pásiky bočných hrán a textúru zvaru balíčka (crimp seal)
   - Vygeneruje štvorcový thumbnail (400×400)

---

## 🛠️ Build pre produkciu

```bash
# 1. Štandardný web build aplikácie
npm run build

# 2. Samostatný standalone embed balík pre externé weby
npm run build:lib
```

Výstup pre externé weby nájdete v priečinku `dist/lib/`:
- `cardcatcher-3d.umd.js` (univerzálny skript pre `<script>` tag)
- `cardcatcher-3d.es.js` (ES modul pre moderné bundlery)

---

## 🛡️ Best Practices pre výkon

1. **Vždy preferujte `ProductDisplay` pred priamym `ProductViewer` v gridových zoznamoch:** V katalógu 50 produktov by inicializácia 50 WebGL plátien súčasne zahltila GPU. `ProductDisplay` použije ultra-rýchly 2D WebP obrázok a WebGL zapne až po kliknutí.
2. **Obmedzenie Pixel Ratio:** V `ProductViewer` je nastavený `dpr={[1, 2]}`. Retina displeje s DPR 3+ netrápia grafický čip.
3. **Environment Mapy:** Namiesto desiatok dynamických svetiel sa používa štúdiový environment preset, ktorý zabezpečuje realistické odrazy prakticky bez výpočtovej záťaže.
