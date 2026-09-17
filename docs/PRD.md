# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Project: Aether & Iron (D&D Top-Down Web Dungeon Crawler)

---

### 1. Product Overview & Vision
*Aether & Iron* adalah web-based tactical turn-based RPG dungeon crawler berlatar dungeon delving & relic hunting (ala anime *DanMachi* / *Frieren* / *Delicious in Dungeon* berpadu dengan tactical D&D 5e).
* **Core Fantasy:** Player adalah seorang petualang berlisensi dari **Adventurer's Guild (HQ)** yang ditugaskan menyelam ke dalam reruntuhan kuno (*The Sunken Reliquary*) untuk mengekstrak relic legendaris, membasmi ancaman monster, dan membawa pulang hasil jarahan untuk dilaporkan ke Guild demi reward & kenaikan rank.
* **Core Mechanics:**
  1. **D&D 5e-inspired Ruleset:** Atribut d20, modifier, Armor Class (AC), Difficulty Class (DC), dan mekanik **Advantage / Disadvantage** taktis berbasis rintangan lingkungan.
  2. **Macro-Graph + Micro-Handcrafted Rooms:** Navigasi makro berbasis node graph antar ruangan, dengan setiap ruangan memiliki grid, tata letak, atmosfer, dan environmental lore yang didesain tematik.
  3. **Mechanical Lore & Consequential Skill Checks:** Membaca lore, prasasti kuno, atau memeriksa mayat petualang masa lalu memberikan **keuntungan taktis nyata** jika sukses (Inspiration, mengungkap kelemahan boss, melumpuhkan trap), namun memberi **kerugian fatal jika gagal** (terkena psychic/curse damage, memicu trap, menarik musuh).
  4. **Merciless Downed State:** Aturan bertahan hidup hardcore D&D 5e. Musuh tidak memiliki ampun dan akan tetap mengeksekusi karakter yang terjatuh (*downed*).
  5. **Zero-Friction Web Delivery:** Berjalan 100% di browser modern tanpa instalasi, performa 60 FPS, responsive layout, state tersimpan di LocalStorage.

---

### 2. User Persona & Experience Goals
* **Target Player:** Penggemar cRPG (*Baldur's Gate*, *Divinity: Original Sin*), tabletop D&D, dan roguelike taktis.
* **Core Loop:**
  1. *Eksplorasi Ruangan:* Memasuki room baru di graph $\to$ membaca narasi pembuka $\to$ menjelajah grid micro-room.
  2. *Interaksi Lingkungan:* Memeriksa altar kuno, menjebol pintu, mendeteksi trap menggunakan d20 Skill Check (STR, INT, WIS, dll.).
  3. *Taktik Turn-Based Combat:* Mengatur posisi, memanfaatkan cover/rintangan untuk memaksakan *Disadvantage* pada musuh atau menghindari *Difficult Terrain*.
  4. *Progression & Story:* Menemukan fragmen jurnal, mengalahkan penjaga ruangan, membuka exit menuju room berikutnya di node graph hingga boss chamber.

---

### 3. Core Mechanics & Technical Specifications

#### A. Character System (D&D Core)
* **Party Mode:** V1 difokuskan pada **Solo Hero** dengan arsitektur data modular yang siap untuk multi-character / multiplayer party di masa mendatang.
* **6 Atribut Pokok:** Strength (STR), Dexterity (DEX), Constitution (CON), Intelligence (INT), Wisdom (WIS), Charisma (CHA).
  * Modifier Formula: $\lfloor (\text{Stat} - 10) / 2 \rfloor$.
* **Point-Buy System:** 27 Poin dasar (Atribut mulai dari nilai 8, maks 15 sebelum racial bonus).
* **Classes (Archetypes):**
  * *Fighter:* HP tinggi (d10 hit die), profisiensi heavy armor, skill aktif *Second Wind* (heal bonus action).
  * *Rogue:* High DEX (d8 hit die), profisiensi stealth/finesse, pasif *Sneak Attack* (bonus damage saat target kena disadvantage atau player dapat advantage).
  * *Wizard:* Low HP (d6 hit die), high INT, mantra *Magic Missile* (auto-hit) dan *Firebolt*.
  * *Cleric:* Support & Tank (d8 hit die), WIS-based, mantra *Cure Wounds* dan *Guiding Bolt*.
* **Combat Stats:**
  * $\text{Max HP} = \text{Base Hit Die} + \text{CON Modifier}$ (+ level scaling).
  * $\text{Armor Class (AC)} = \text{Base Armor} + \text{DEX Modifier}$ (dibatasi armor type).
  * $\text{Speed} = \text{Movement Range}$ (misal: 6 tile per turn).
* **Downed State & Merciless Death Saving Throws (D&D 5e Hardcore Rule):**
  * Saat HP mencapai 0, karakter jatuh ke status **Downed** (kehilangan turn reguler).
  * Setiap awal giliran player, lakukan **Death Saving Throw** ($1d20$ murni tanpa modifier):
    * $\text{Roll} \ge 10$: Sukses (1 poin).
    * $\text{Roll} < 10$: Gagal (1 poin).
    * **Natural 20:** Keajaiban petualang! Langsung bangkit dengan $1 \text{ HP}$.
    * **Natural 1:** Dihitung sebagai $2 \text{ kegagalan}$ sekaligus.
  * **3 Sukses:** Karakter *Stabilized* (jika semua musuh tewas $\to$ bangun dengan $1 \text{ HP}$ dan status *Exhausted*).
  * **3 Gagal:** Gugur di dalam reruntuhan (*Perma-death / Quest Failed*).
  * **Merciless Enemy AI:** Jika musuh berada di dekat karakter yang downed dan tidak ada ancaman lain yang mengalihkan perhatian, musuh akan menyerang karakter yang tak berdaya. Serangan musuh jarak dekat mendapat **Advantage**, dan jika mengenai target yang downed, otomatis memberikan **2 kegagalan Death Save langsung**.

#### B. The Combat Engine & The Obstacle / Hazard System
* **Transisi State (Free-Roam $\leftrightarrow$ Turn-Based):**
  * *Free-Roam Exploration:* Saat tidak ada musuh aktif, player bergerak bebas tanpa batas turn/movement point untuk eksplorasi ruangan, membaca lore, dan interaksi lingkungan.
  * *Combat Trigger:* Begitu musuh mendeteksi player (Line-of-Sight), game beralih ke *Turn-Based Tactical Mode*.
  * *Combat Exit:* Ketika semua musuh di ruangan dikalahkan, game otomatis kembali ke mode *Free-Roam*.
* **Initiative:** Saat musuh melihat player, sistem me-roll $\text{Initiative} = 1d20 + \text{DEX Modifier}$. Giliran berjalan berurutan berdasarkan nilai tertinggi.
* **Action Economy per Giliran:**
  * $1 \times \text{Action}$ (Attack, Cast Spell, Dash, Use Item).
  * $1 \times \text{Bonus Action}$ (Quick Spell, Offhand Attack, Special Class Trait).
  * $\text{Movement Points}$ (Berdasarkan Speed, berkurang saat melangkah).
* **Advantage & Disadvantage Engine:**
  * **Normal Roll:** $1d20 + \text{Modifier}$ vs $\text{Target AC / DC}$.
  * **Advantage:** Roll 2 buah $d20$, ambil nilai **tertinggi** ($\max(d20_a, d20_b) + \text{Mod}$).
  * **Disadvantage:** Roll 2 buah $d20$, ambil nilai **terendah** ($\min(d20_a, d20_b) + \text{Mod}$).
  * **Cancellation:** Jika ada $\ge 1$ sumber Advantage DAN $\ge 1$ sumber Disadvantage, keduanya saling meniadakan $\to$ kembali ke Normal Roll.
* **Kondisi Lingkungan Pemicu Disadvantage:**
  1. *Difficult Terrain (Rubble, Shallow Water):* Melangkah menghabiskan $2\times$ movement point. Menyerang dari atas tile ini memberi **Disadvantage** pada attack roll.
  2. *Hazard Tile (Webbing, Spikes, Poison Puddle):* Masuk ke tile memicu Saving Throw (DEX/CON vs DC). Gagal $\to$ status *Restrained* (semua serangan player kena Disadvantage, musuh menyerang player dapat Advantage) atau damage.
  3. *Close-Quarters Ranged Penalty:* Melakukan ranged attack saat musuh berada di tile adjacent (1 tile) $\to$ **Disadvantage** otomatis.
  4. *Obstacle / Half-Cover:* Menyerang musuh yang berada di balik rintangan setengah badan (meja runtuh, peti, pilar rusak) $\to$ Musuh mendapat $+2 \text{ AC}$ atau tembakan player kena **Disadvantage**.

#### C. Macro-Graph & Micro-Handcrafted Rooms
* **Macro Dungeon Graph:**
  * Representasi data graph adjacency list: Tiap node adalah 1 Room unik yang punya koneksi pintu arah (North, South, East, West).
  * Map Minimap di UI menampilkan room yang sudah dijelajahi, posisi player saat ini, dan pintu yang terkunci.
* **Micro Handcrafted Room Data Schema:**
  * Didefinisikan dalam format JSON.
  * Layout grid 2D (ASCII matrix, e.g. 14x10 tile).
  * Komponen room:
    * Tile Types: Wall, Floor, Difficult Terrain (Rubble), Hazard (Spike/Web), Door (Exit to other node).
    * Environmental Props: Altar, Bookshelf, Sarcophagus, Chest.
    * Interactive Skill Checks: Obyek lingkungan dengan target Stat & DC (contoh: Pintu terkunci butuh `[DEX 13]` untuk lockpick atau `[STR 15]` untuk didobrak).
    * Lore Snippet: Teks naratif tematik yang muncul di log saat memasuki ruangan.
    * Encounters: Penempatan musuh dengan AI taktis sederhana.

#### D. User Interface & Presentation
* **Hybrid Rendering:**
  * **Game Canvas (Center/Left):** Me-render grid 2D top-down, karakter, musuh, line-of-sight/fog of war, path preview, dan damage floating numbers.
  * **HTML/Tailwind Overlay & Sidebar:**
    * *Character Sheet & Party Status:* Potret, HP Bar, AP/MP status, Spell slots.
    * *Combat Action Bar:* Tombol Attack, Skill, Spell, End Turn.
    * *Dice Roll HUD Modal:* Menampilkan animasi lempar dadu d20 fisik virtual, indikator label *ADVANTAGE* (hijau) / *DISADVANTAGE* (merah), serta perhitungan formula transparan.
    * *Atmospheric Chronicle Log:* Menampilkan log narasi cerita, dialog interaksi, dan riwayat roll dadu.

---

### 4. Non-Functional Requirements
* **Performa:** Render stabil pada 60 FPS di layar standar menggunakan HTML5 2D Canvas context.
* **Responsif:** Skala canvas fleksibel menyesuaikan desktop browser window.
* **Zero Dependency Heavy Engines:** Tanpa engine berat (Unity/Unreal/Godot Web export). Menggunakan teknologi native web modern untuk load time instan (<1.5 detik).
* **Persistence:** Menyimpan state karakter, inventaris, posisi graph dungeon, dan status room ke `window.localStorage`.

---

### 5. Out of Scope (Untuk Versi 1.0)
* Real-time multiplayer (fokus murni single-player tactical narrative).
* Animasi 3D kompleks (fokus pada representasi token/sprite 2D top-down yang bersih dan readable).
* Full voice acting (menggunakan teks berbobot dan sound effects ambient/retro).
