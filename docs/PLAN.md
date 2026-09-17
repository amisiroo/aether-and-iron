# IMPLEMENTATION & DEVELOPMENT PLAN
## Project: Aether & Iron (D&D Web Dungeon Crawler)

Dokumen ini memetakan tahapan eksekusi teknis dari fondasi arsitektur hingga deliverable game yang dapat dimainkan langsung di browser.

---

### Phase Overview & Milestones

```
[M0: Setup & Core Types] ────► [M1: Character Creation & D&D Engine]
                                                │
                                                ▼
[M3: Combat & Disadvantage] ◄──── [M2: Canvas Grid & Handcrafted Room]
            │
            ▼
[M4: Macro Graph & Story Checks] ────► [M5: Chapter 1 Dungeon & Boss] ────► [M6: Audio & Polish]
```

---

### Milestone 0: Scaffold Proyek & Arsitektur Inti
* **Tujuan:** Menyiapkan tooling pengembangan yang cepat, type-safe, dan modular.
* **Tasks:**
  1. Inisialisasi project menggunakan **Vite + TypeScript + Tailwind CSS**.
  2. Setup arsitektur modular di folder `src/`:
     * `src/core/`: Aturan D&D 5e (stats, modifier, d20 roller, advantage evaluator).
     * `src/data/`: Definisi schema JSON untuk Room, Enemy, Item, Spell.
     * `src/renderer/`: Canvas 2D renderer (grid, token, hazards, fog of war, overlay).
     * `src/graph/`: Macro dungeon graph manager & room transitions.
     * `src/ui/`: Komponen DOM/Tailwind (Character sheet, Dice roll modal, Narrative log, Action bar).
     * `src/state/`: Global game state management (player, active combat, dungeon state).
* **Deliverable:** Template aplikasi berjalan bersih tanpa error build (`npm run build`).

---

### Milestone 1: Sistem D&D Core & Layar Character Creation
* **Tujuan:** Player dapat membuat karakter dengan sistem Point-Buy resmi D&D 5e dan melihat status kalkulasinya.
* **Tasks:**
  1. Implementasi modul kalkulasi D&D:
     * Point-Buy pool (27 poin, rentang stat 8–15).
     * Stat modifiers: $\lfloor (\text{Stat} - 10) / 2 \rfloor$.
     * HP & AC derived stats.
  2. Implementasi 4 Class:
     * *Fighter* (d10 HP, Heavy Armor AC 16, Second Wind).
     * *Rogue* (d8 HP, Leather Armor AC 14, Sneak Attack).
     * *Wizard* (d6 HP, Mage Robes AC 11, Magic Missile, Firebolt).
     * *Cleric* (d8 HP, Scale Mail AC 15, Cure Wounds, Sacred Flame).
  3. UI Component Character Creator:
     * Tampilan interaktif alokasi poin (+/-) dengan sisa poin live.
     * Deskripsi skill dan lore kelas.
     * Tombol "Embark into the Ruins" yang mengekspor state karakter ke game loop.
* **Verifikasi:** Stat tidak bisa melebihi batas 27 poin, kalkulasi modifier, HP, dan AC akurat sesuai aturan 5e.

---

### Milestone 2: Micro-Room Handcrafted Engine & Grid Exploration
* **Tujuan:** Render ruangan 2D berdasar matriks JSON dengan terrain rintangan dan sistem pergerakan bebas saat non-combat.
* **Tasks:**
  1. Parser matriks ASCII/JSON Room (`#` tembok, `.` lantai, `~` rubble/difficult terrain, `^` hazard spike, `D` door).
  2. Canvas 2D Tile Renderer:
     * Rendering lantai bertema batu kuno, reruntuhan, dan genangan air.
     * Rendering token karakter dan indikator orientasi.
  3. Pergerakan Karakter:
     * Input keyboard (WASD / Panah) atau klik tile.
     * Deteksi collision dinding dan batas ruangan.
  4. Deteksi Medan:
     * Melangkah ke *Difficult Terrain* memotong movement double.
     * Melangkah ke *Hazard Tile* langsung memicu prompt DEX Saving Throw.
  5. Fog of War / Field of View (FOV) sederhana (Raycasting tile visibility).
* **Verifikasi:** Karakter bisa menjelajah ruangan dengan collision akurat dan indikator terrain muncul di HUD.

---

### Milestone 3: Tactical Turn-Based Combat & Evaluator Disadvantage
* **Tujuan:** Sistem combat taktis D&D dengan visualisasi dadu transparan dan mekanik disadvantage rintangan.
* **Tasks:**
  1. Turn Scheduler & Initiative:
     * Roll Initiative $1d20 + \text{DEX Mod}$ untuk player dan semua monster di room.
     * Urutan antrean giliran (Turn Queue bar di UI).
  2. Action Economy State:
     * Reset per ronde: 1 Action, 1 Bonus Action, Movement points sesuai speed.
  3. Mesin Evaluasi Advantage & Disadvantage:
     * Cek status tile tempat attacker berdiri (*Difficult Terrain / Rubble* $\to$ Disadvantage).
     * Cek rintangan garis pandang (*Cover / Intervening Obstacle* $\to$ Disadvantage).
     * Cek jarak senjata ranged (*Adjacent Enemy* $\to$ Disadvantage).
     * Cek status player (*Restrained / Prone* $\to$ Disadvantage).
     * Rule Cancellation (Advantage + Disadvantage = Normal).
  4. Resolusi Serangan & Visual Dice Modal:
     * Animasi roll 2 dadu d20 (jika advantage/disadvantage) atau 1 dadu (normal).
     * Penanda jelas dadu mana yang gugur / diambil.
     * Pembandingan vs Armor Class (AC) musuh.
     * Roll Damage berdasarkan weapon dice (misal: $1d8 + \text{STR}$ untuk Longsword).
  5. Downed State & Merciless Death Saving Throws:
     * Saat player HP = 0, status berubah jadi *Downed*.
     * Lempar Death Save d20 tiap giliran: 3 sukses = Stabilized, 3 gagal = Game Over. Nat 20 = Bangkit 1 HP, Nat 1 = 2 failures.
  6. Merciless Enemy AI:
     * AI bergerak mendekati target terdekat dan menyerang.
     * Jika target dalam kondisi *Downed*, AI tetap menyerang (Advantage to hit, 2 Death Save failures jika kena).
* **Verifikasi:** Serangan saat berdiri di atas rubble terbukti melempar 2 dadu dan mengambil nilai terendah secara konsisten.

---

### Milestone 4: Macro-Graph & Environmental Narrative
* **Tujuan:** Menghubungkan ruangan-ruangan menjadi satu kesatuan dungeon dengan skill check lingkungan berdampak taktis.
* **Tasks:**
  1. Dungeon Graph Manager:
     * Pindah ruangan saat player menyentuh tile pintu (Door Transition).
     * Minimap Graph menampilkan peta topologi node dungeon.
  2. Mechanical Lore & Consequential Skill Checks:
     * Objek bernarasi di dalam room (Altar, Pintu Berkarat, Fragmen Relief, Jurnal Petualang Gugur).
     * Pilihan interaksi berbasis D&D Stat Check (contoh: `[STR 14] Jebol pintu`, `[INT 12] Pelajari Rune Kuno`).
     * Hasil nyata:
       * *Sukses:* Mendapat status *Inspiration* (+1d20 reroll), mengungkap kelemahan boss, atau melumpuhkan trap di kamar sebelah.
       * *Gagal:* Terkena trap, alarm memicu spawn monster ekstra, atau terkena psychic damage/curse status.
  3. Chronicle / Narrative Log:
     * Panel riwayat teks petualang guild mencatat setiap kejadian, kutipan lore, dan hasil roll dadu.
* **Verifikasi:** Berpindah antar 2-3 ruangan mempertahankan state musuh/benda yang telah dikalahkan atau diambil.

---

### Milestone 5: Content Creation — Chapter 1: "The Sunken Reliquary"
* **Tujuan:** Menghadirkan konten playable yang utuh dan dramatis untuk dimainkan.
* **Tasks:**
  1. Desain 4 Handcrafted Themed Rooms:
     * **Room 1: The Weeping Threshold (Entrance):** Pengenalan suasana, obor redup, 1 pintu kayu lapuk dengan check STR/DEX.
     * **Room 2: The Scriptorium of Ashes (Exploration & Hazard):** Banyak buku terbakar, lantai runtuh (*difficult terrain*), 1 Skeleton Archer di balik meja runtuh (*cover disadvantage*).
     * **Room 3: The Flooded Crypt (Combat Ambush):** Genangan air, sarang laba-laba raksasa (*hazard restrained*), encounter 2 Giant Spiders.
     * **Room 4: Sanctum of the Iron Warden (Boss Fight):** Ruang tahta megah, interaksi 2 pilar penyangga, Boss *The Iron Warden* dengan phase khusus.
  2. Balancing angka D&D: Stat musuh disesuaikan agar menantang namun adil untuk Level 1 player.
* **Verifikasi:** Player dapat menyelesaikan Chapter 1 dari pembuatan karakter hingga mengalahkan Boss.

---

### Milestone 6: Audio, Local Persistence & Polish
* **Tujuan:** Game terasa responsif, atmosferik, dan dapat menyimpan progress.
* **Tasks:**
  1. Web Audio Integration: Sound effect lempar dadu, critical hit, monster hit, dan ambient dungeon loop.
  2. LocalStorage Persistence: Fitur Save & Load game state (HP, inventory, explored rooms).
  3. Responsiveness & Polish visual: Floating damage numbers, particle feedback pada tile, tooltips pada hover skill/item.
* **Verifikasi:** Refresh browser mengembalikan player pada posisi dan status terakhir tanpa bug.
