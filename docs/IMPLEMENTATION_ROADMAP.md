# Aether & Iron — Implementation Roadmap

## Tujuan

Mengembangkan Aether & Iron secara bertahap menjadi tactical dungeon crawler yang stabil, mudah diuji, dan siap diperluas ke beberapa chapter.

## Aturan delivery

- Satu fase menghasilkan fitur yang dapat dimainkan dan diverifikasi.
- Setiap fase dikerjakan pada branch terpisah.
- Coder wajib menambahkan atau memperbarui test untuk logic baru.
- Tidak ada merge jika `npm run build`, test, dan audit terkait gagal.
- Setelah merge, jalankan smoke test di browser dan verifikasi deployment GitHub Pages.
- Jangan melakukan upgrade major dependency bersamaan dengan feature besar.

## Strategi delegasi coder

Setiap fase didelegasikan sebagai task terisolasi kepada coding agent dengan:

1. konteks repo dan acceptance criteria;
2. daftar file/modul yang boleh disentuh;
3. test yang wajib dibuat;
4. instruksi commit/branch;
5. laporan perubahan, test, risiko, dan pekerjaan tersisa.

Saya akan melakukan review diff, menjalankan build/test, dan memverifikasi hasil sebelum fase berikutnya dimulai. Task yang saling bergantung dikerjakan berurutan; task UI, data, dan dokumentasi yang independen dapat dikerjakan paralel memakai worktree terpisah.

---

## Fase 0 — Baseline dan fondasi kualitas

**Status:** audit awal selesai; build production berhasil.

### Scope

- Catat baseline performa dan ukuran bundle.
- Tambahkan Vitest dan test runner.
- Tambahkan lint/format dasar bila belum tersedia.
- Buat struktur domain agar logic tidak terus bertambah di `App.tsx`.
- Tambahkan error boundary dan logging development yang aman.
- Dokumentasikan command lokal: install, dev, build, test, preview.

### Acceptance criteria

- `npm run build` berhasil.
- `npm test` tersedia dan berhasil.
- Minimal test smoke untuk `dnd.ts`.
- Tidak ada perubahan perilaku gameplay yang tidak disengaja.

---

## Fase 1 — Movement, pathfinding, dan collision

### Scope

- Buat tile map API terpusat; jangan lagi menyebarkan pemeriksaan `char === '#'`, `~`, atau `^`.
- Implementasikan BFS/A* untuk jalur tile.
- Blokir gerakan menembus dinding, obstacle, entity, dan batas map.
- Tampilkan preview path, movement cost, dan alasan tile tidak valid.
- Dukung keyboard, mouse, dan touch dengan aturan yang sama.
- Pastikan rubble/difficult terrain dihitung per tile, bukan hanya jarak Manhattan.

### Acceptance criteria

- Tidak dapat berpindah menembus dinding atau entity.
- Path preview sama dengan jalur yang benar-benar ditempuh.
- Movement cost akurat untuk lantai dan rubble.
- Keyboard dan mouse menghasilkan hasil identik.
- Test mencakup path valid, path terblokir, dan path tidak tersedia.

---

## Fase 2 — Combat engine dan enemy AI

### Scope

- Pisahkan combat state dari UI.
- Turn queue dan initiative yang eksplisit.
- AI: chase, attack, target selection, cover, hazard avoidance, retreat sederhana.
- Gunakan pathfinding dari Fase 1.
- Rapikan action, bonus action, movement, cooldown, conditions, death save.
- Tambahkan telegraph serangan area dan feedback yang konsisten.

### Acceptance criteria

- Urutan turn deterministik berdasarkan initiative dan tie-break rule.
- Enemy tidak menembus obstacle.
- Enemy dapat bergerak dan menyerang sesuai range.
- Action economy reset hanya pada awal turn yang tepat.
- Advantage/disadvantage, cover, critical, downed, dan death save memiliki test.
- Combat dapat selesai tanpa state macet.

---

## Fase 3 — Save game, autosave, dan state integrity

### Scope

- Pindahkan persistence ke modul `saveGame`.
- Autosave setelah movement penting, combat, room transition, loot, dan interaction.
- Debounce autosave agar tidak menulis berlebihan.
- Tambahkan save schema version dan migration.
- Validasi data saat load; save rusak harus ditolak dengan fallback aman.
- Tambahkan manual save slots serta export/import JSON.

### Acceptance criteria

- Refresh mengembalikan state terakhir yang valid.
- HP, posisi, inventory, room, enemies, dan chronicle tersimpan.
- Save versi lama dapat dimigrasikan atau ditolak secara jelas.
- Save rusak tidak membuat aplikasi crash.
- Test round-trip save/load dan migration tersedia.

---

## Fase 4 — Loot, inventory, dan equipment

### Scope

- Item definitions dan loot tables typed.
- Chest, enemy drops, reward room, potion, scroll, weapon, armor, relic.
- Inventory UI dan equipment slots.
- Stat modifiers dari equipment.
- Item rarity dan unique relic effect.
- Tooltips yang menjelaskan perubahan stat sebelum equip.

### Acceptance criteria

- Item dapat diperoleh, disimpan, digunakan, dan di-equip.
- Equipment mengubah stat secara benar dan dapat dilepas.
- Loot tidak duplikat karena rerender/load.
- Item tersimpan dalam save game.
- Test inventory mutation, equipment stat, dan item consumption.

---

## Fase 5 — XP, leveling, dan class progression

### Scope

- XP dari enemy, room, quest, dan discovery.
- Level-up flow dengan pilihan pemain.
- Class skill tree untuk Fighter, Rogue, Wizard, dan Cleric.
- Unlock/upgrade skill, cooldown, dan resource.
- Balance pass untuk level awal.

### Acceptance criteria

- XP dan level tersimpan dan tidak dapat diberikan dua kali.
- Level-up tidak menghilangkan skill atau item.
- Tiap class memiliki progression awal yang berbeda.
- Skill baru terlihat dan dapat digunakan di combat.
- Test XP threshold, level-up, dan skill unlock.

---

## Fase 6 — Quest, narrative, dan environmental interaction

### Scope

- Quest/objective model dengan status active, completed, failed.
- Branching choice dan consequence flags.
- Puzzle rune, altar, pilar, door check, rescue event.
- Chronicle terstruktur berdasarkan event ID.
- Room unlock/lock dan perubahan layout berdasarkan consequence.

### Acceptance criteria

- Objective muncul, berubah status, dan memberi reward.
- Pilihan narrative menghasilkan consequence yang terlihat.
- Puzzle dapat diselesaikan dan tidak dapat dieksploitasi dengan resolve berulang.
- Progress tersimpan dan dapat dilanjutkan setelah reload.
- Test quest transitions dan consequence flags.

---

## Fase 7 — Boss phase system dan Chapter 1 completion

### Scope

- Iron Warden dengan minimal tiga phase.
- Phase transition berdasarkan HP/event.
- Summon, arena hazards, pilar, telegraph ultimate.
- Victory flow, relic reward, chapter summary.
- Balance pass dari character creation sampai boss.

### Acceptance criteria

- Semua room Chapter 1 dapat diselesaikan dari awal sampai akhir.
- Boss phase transition hanya terjadi sekali pada threshold yang benar.
- Boss tidak macet setelah summon atau arena change.
- Victory state dan reward tersimpan.
- Playthrough manual penuh berhasil tanpa console error.

---

## Fase 8 — Tutorial, accessibility, dan mobile UX

### Scope

- Tutorial interaktif untuk movement, combat, cover, advantage, dan downed state.
- Keyboard focus dan shortcut hints.
- Colorblind-safe indicators.
- Reduced-motion setting.
- Font/UI scaling.
- Touch controls, tap-to-move, responsive canvas, portrait fallback.

### Acceptance criteria

- Pemain baru dapat menyelesaikan tutorial tanpa dokumentasi eksternal.
- Semua aksi utama dapat dilakukan via keyboard.
- Informasi penting tidak hanya dibedakan dengan warna.
- Layout dapat digunakan pada desktop dan mobile viewport.
- Tidak ada kontrol yang tertutup atau terpotong.

---

## Fase 9 — Replayability dan quality-of-life

### Scope

- Combat log detail dan statistik run.
- Replay ringkas hasil combat.
- New Game+.
- Challenge modifiers dan permadeath mode.
- Random event antar-room.
- Daily/seeded dungeon sebagai fondasi future content.
- Achievements lokal.

### Acceptance criteria

- Run kedua dapat menghasilkan variasi yang bermakna.
- Seed dapat direproduksi saat diperlukan.
- Challenge modifiers terlihat jelas sebelum mulai.
- Statistik tidak menggandakan event ketika save/load.

---

## Fase 10 — Release hardening dan Chapter 2 preparation

### Scope

- Performance profiling dan optimasi render.
- Bundle/code splitting bila diperlukan.
- Accessibility smoke test.
- Browser matrix test.
- Error reporting tanpa membocorkan data pengguna.
- Upgrade dependency terencana dan terpisah dari feature work.
- Content/data schema untuk chapter baru.
- Release checklist dan changelog.

### Acceptance criteria

- Build production dan GitHub Actions berhasil.
- Tidak ada high/critical vulnerability.
- Tidak ada uncaught error pada smoke test.
- Save dari release sebelumnya dapat dimigrasikan.
- Chapter 1 memiliki definition of done yang terdokumentasi.

---

## Urutan dependency

```text
Fase 0
  ↓
Fase 1 ──► Fase 2 ──► Fase 7
  ↓          ↓
Fase 3 ──► Fase 4 ──► Fase 5
                         ↓
                    Fase 6 ──► Fase 7
                                      ↓
                          Fase 8 ──► Fase 9 ──► Fase 10
```

## Definition of Done setiap fase

- Kode berada pada branch fase/feature yang jelas.
- Acceptance criteria terpenuhi.
- Test baru ditambahkan untuk logic baru.
- `npm test` dan `npm run build` berhasil.
- Tidak ada perubahan tidak terkait dalam diff.
- Manual smoke test dilakukan pada fitur utama.
- Risiko atau technical debt dicatat.
- Perubahan siap direview sebelum merge ke `main`.

## Pembagian task coder pertama

1. **Foundation coder:** Fase 0, test infrastructure, domain boundaries.
2. **Movement coder:** Fase 1, tile map, pathfinding, collision, preview.
3. **Combat coder:** Fase 2, combat state machine, AI, turn queue.
4. **Persistence coder:** Fase 3, autosave, schema validation, migration.
5. **Content coder:** Fase 4–7, loot, progression, quest, boss.
6. **UX coder:** Fase 8–9, tutorial, accessibility, mobile, replayability.
7. **Release coder:** Fase 10, profiling, browser QA, release hardening.

Coder boleh bekerja paralel hanya jika kontrak tipe dan file boundaries sudah disepakati. Combat tidak dimulai sebelum API movement stabil; content tidak dimulai sebelum persistence dan event model memiliki kontrak yang jelas.
