# Xbox Lab 1.0.1 — roadmap / recovery research — 2026-10-09

Status: **EXPERIMENTAL / RESEARCH**

This document consolidates the current Xbox Lab direction discussed on 2026-10-09. It is intentionally conservative: confirmed public facts, our own engineering ideas, and unverified hypotheses must remain clearly separated.

## 0. Core goal

Build **Xbox Lab** as a recovery + diagnostic workflow for Xbox Series first, with a longer-term unified hardware interface based on **RP2350 / Pico 2** for Xbox 360 + Xbox One family + selected Xbox Series service interfaces.

The project should help answer two different problems:

1. **Diagnostics** — collect enough evidence to explain boot/update failures such as the Series X ~94% update loop.
2. **Recovery** — preserve per-console data while the console still works, so a future SSD/storage failure has a realistic recovery path.

Default policy: **READ-ONLY FIRST**.

Never perform write-back to original evidence unless the exact structure, electrical interface, backup integrity and recovery path are already proven.

---

# 1. Xbox Lab Recovery Backup

## Product concept

User-facing idea:

> **Make a recovery backup while your Xbox still works.**

The first useful release does not need to promise that every failed console can be repaired. Its job is to preserve everything that may later become necessary for recovery.

## Recovery package contents

Initial safe package should contain at minimum:

- full 1 GB Xbox Series **XBFS** image,
- full GPT / partition layout metadata,
- disk/NVMe identification,
- NVMe SMART / health,
- power-on hours when available,
- hashes for all captured images/files,
- complete `System Support` data/logs when accessible,
- extracted XBFS inventory,
- console serial number when it can be parsed reliably,
- certificate presence / parse status,
- certificate validation result only when cryptographic verification is actually implemented,
- full SPI NOR dump when a safe acquisition method has been proven for the exact board/chip,
- future SBFS-related dump/data if/when the structure and physical storage are confirmed.

Suggested package format (working idea):

`<serial>_<date>.xblab`

Possible internal structure:

```text
manifest.json
ssd/
  identify.json
  smart.json
  gpt.json
xbfs/
  xbfs.bin
  files.json
  extracted/...
system_support/
  ...
nor/
  spi_nor.bin
  metadata.json
hashes.sha256
report.html
```

The container format is not final. A ZIP-like archive with a signed/hashed manifest is enough for prototype work.

## UI fields immediately useful to technicians

After capture, Xbox Lab should show at least:

- console serial number,
- console certificate: present / parseable / verified / invalid / unknown,
- SSD model,
- SSD firmware,
- capacity,
- SMART health,
- power-on hours,
- XBFS SHA-256,
- NOR SHA-256 if captured,
- detected System Support errors,
- parsed update/error log summary,
- backup validity status.

Important: do not call a certificate `valid` merely because the file exists or parses. `VALID` should mean the implemented verification procedure has passed.

---

# 2. Xbox Series — Create Replacement SSD

## Phase A — conservative prototype

Do not begin with a minimal reconstructed XBFS.

First prove this workflow:

1. Read original SSD metadata and GPT.
2. Capture full 1 GB XBFS.
3. Hash and verify the capture.
4. Prepare a known-compatible replacement SSD.
5. Recreate the required GPT/partition layout.
6. Restore the full original 1 GB XBFS exactly.
7. Verify written data against the source image.
8. Use the proper Xbox offline recovery/update path for the remaining system content.
9. Record POST + System Support + XBFS evidence during the first boot/update.

The tool must refuse destructive actions when the target disk cannot be identified unambiguously.

## Phase B — minimal recovery package research

Only after full-XBFS recovery works reliably:

- determine which XBFS files/regions are truly per-console,
- determine which data can be regenerated safely,
- test whether a fresh 1 GB XBFS image can be built from a minimal per-console package,
- verify file table revisions / sequence numbers / UUID / hashes / offsets,
- compare against real factory/original images.

Potential long-term result:

`Console Recovery Package` much smaller than 1 GB, which Xbox Lab can expand into a correct full XBFS image.

This is **not yet proven**.

## SSD compatibility caveat

Do not claim that any M.2 2230 NVMe will work.

Track:

- exact SSD model,
- controller when known,
- firmware,
- capacity,
- clone method,
- XBFS-only vs full-disk transfer,
- OS build,
- final result,
- POST/error result.

---

# 3. XBFS analysis

Public references already useful to the project:

- Xbox Research XBFS documentation:
  - https://xboxoneresearch.github.io/wiki/boot/xbox-boot-file-system/
  - https://github.com/xboxoneresearch/wiki/blob/master/docs/boot/xbox-boot-file-system.md
- `xbfs-tool`:
  - https://github.com/RetroTechCorner/xbfs-tool
- `xvdtool`:
  - https://github.com/emoose/xvdtool
- `QuantumTunnel`:
  - https://github.com/TitleOS/QuantumTunnel

Known useful XBFS entries include:

- `certkeys.bin`
- `sp_s.cfg`
- `smcerr.log`
- dynamic `*_d.cfg` files
- `update.cfg`
- `update2.cfg`
- system XVDs

## Required Xbox Lab XBFS functions

- raw 1 GB acquisition,
- SHA-256,
- file inventory,
- extract to a working copy,
- file-level diff,
- binary range diff,
- filetable/sequence comparison,
- mapping changed ranges back to known files where possible,
- BEFORE / AFTER update comparison.

---

# 4. System Support automation

A raw partition dump alone is not enough for useful service diagnostics.

Xbox Lab should automatically collect and parse `System Support` data when available.

Required behaviour:

- preserve directory structure,
- preserve timestamps,
- hash files,
- parse update/setup/error logs,
- parse `SystemSupport\\oddfwupd\\*.log`,
- surface E-codes / HRESULT / NTSTATUS,
- detect keywords such as `failed`, `timeout`, `verify`, `rollback`, `commit`, `staging`,
- generate a technician-readable timeline.

The aim is that a technician does not need to manually open many text files after every dump.

---

# 5. SPI NOR / Southbridge research

The SPI/NOR side is considered potentially important for Series recovery and must be preserved whenever safe acquisition is possible.

## Rules

Before wiring or powering any flash interface:

1. identify exact console/board revision,
2. photograph the area,
3. read the exact IC marking,
4. obtain the datasheet,
5. confirm package pinout,
6. confirm VCC / IO voltage,
7. confirm whether in-circuit reading is electrically safe,
8. take at least two independent reads,
9. compare SHA-256 before accepting the dump.

Do not assume 1.8 V or 3.3 V globally.

Do not assume that an 8-pin part is automatically a standard 25-series layout without identifying it.

## NOR comparison experiment

For every test console:

- `NOR_A_1.bin`
- `NOR_A_2.bin`
- require identical hashes
- controlled console event (boot/update/board swap if explicitly planned)
- `NOR_B_1.bin`
- `NOR_B_2.bin`
- require identical hashes
- BEFORE/AFTER binary diff

Compare across several consoles of the same model/build to classify regions as:

- stable/common,
- per-console candidate,
- dynamic/update-state candidate,
- unknown.

Do not name undocumented fields without evidence.

## Donor/provisioning experiment

Interesting future test:

1. dump donor board/NOR before installation,
2. install in controlled test console,
3. boot/update once,
4. dump again,
5. diff.

If repeatable changes appear, investigate whether the platform provisions or rewrites board-local state.

This is a hypothesis test, not a confirmed behaviour.

---

# 6. SBFS research

Treat **SBFS** separately from the SSD XBFS.

Do not state that the Series SPI NOR is definitely a complete SBFS image until verified on a real dump.

Research task:

- acquire reliable Series SPI/NOR dumps,
- inspect for known signatures/structures,
- compare with public Xbox Research information,
- identify whether a parseable SBFS exists and where,
- inventory contents,
- correlate changes with XBFS/System Support/POST.

If a public parser exists and is verified against Series data, add it as a reference implementation rather than inventing a format.

---

# 7. Xbox One / One S / One X eMMC support

## Why add it

Xbox One eMMC failures may be uncommon in daily service, but supporting these consoles would make Modi Flasher/Xbox Lab cover a much larger part of the Xbox family in one tool.

Goal:

**in-circuit READ-ONLY eMMC acquisition without BGA removal**, where supported by the exact board revision and proven electrical procedure.

Models to research separately:

- Xbox One (FAT),
- Xbox One S,
- Xbox One X.

Do not treat them as one electrical profile.

## First implementation

For each supported board:

- board profile,
- verified test points,
- `CLK`, `CMD`, `DAT0` interface where appropriate,
- required reset/isolation procedure,
- voltage-domain definition,
- full raw dump,
- second independent read,
- SHA-256 comparison,
- only then parser/diff.

No write support in the first implementation.

## Research targets

- identify per-console areas,
- identify boot/recovery-critical sectors,
- compare same-board before/after updates,
- compare several consoles of the same revision,
- determine whether a minimal recovery subset is possible.

---

# 8. Modi Flasher — hardware direction

## Platform decision

**New development targets RP2350 / Pico 2 only.**

RP2040 is no longer the intended final hardware platform for the new universal service unit.

Reasoning:

- low cost,
- more performance/headroom,
- suitable programmable IO resources,
- room for multiple service modes,
- better foundation for future high-speed dump workflows.

## Long-term device concept

One service device with switchable profiles/modes:

- Xbox 360 NAND,
- Xbox 360 4 GB eMMC,
- Xbox One / One S / One X eMMC,
- 8-pin SPI NOR where electrically compatible,
- UART bridge/logger,
- Xbox Series POST/AARDVARK interface where applicable,
- future board-specific diagnostic buses.

Important: `one device` does **not** mean `one raw pinout`.

Hardware must include proper board-specific routing and protection.

## Electrical requirements

Design for:

- 1.8 V / 3.3 V level-domain handling,
- direction-safe level translation where required,
- current/ESD protection,
- no accidental target powering from the flasher,
- selectable/isolated buses,
- clearly defined GND/reference rules,
- safe defaults on boot/reset,
- target detection before bus drive where feasible.

---

# 9. Always-connected diagnostic interface idea

Workshop concept:

Leave the RP2350 service module connected during diagnostics.

While the console is powered:

- capture UART when that board exposes a useful UART,
- capture Xbox Series POST via the proper documented Series interface (AARDVARK/I2C),
- timestamp and store logs.

After the console is shut down and the target bus is electrically safe:

- switch to flash acquisition mode,
- read SPI NOR / NAND / eMMC according to that board profile,
- correlate the flash image with the just-recorded runtime log.

Do **not** switch buses or drive flash lines while a console is active unless that exact workflow is proven safe.

Possible UX:

```text
Select console / board
  -> Live Diagnostics
  -> Stop console
  -> Safe-state check
  -> Read Flash
  -> Verify x2
  -> Analyze
  -> Generate Case Report
```

---

# 10. Xbox 360 -> Xbox One support path

Existing Modi Flasher work on Xbox 360 is the development base.

Suggested order:

1. stabilize current Xbox 360 NAND/eMMC read/write paths,
2. separate hardware abstraction from console profile,
3. add RP2350 transport layer,
4. add read-only Xbox One family profiles,
5. validate repeated reads,
6. add parser/diff tooling,
7. consider selective restore only after field validation.

Possible UI/integration label:

**Xbox One Support**

If integration into J-Runner or a J-Runner-derived workflow is pursued, treat it as a new project integration target — do not imply that official J-Runner already supports this Xbox One workflow.

---

# 11. Xbox Series POST / live diagnostics

For Series, prioritize the public Xbox Research POST route rather than assuming a useful generic CPU UART.

References:

- https://github.com/xboxoneresearch/PicoDurangoPOST
- https://github.com/xboxoneresearch/XboxPostcodeMonitor
- https://errors.xboxresearch.com/

Xbox Lab should eventually import live POST and correlate it with:

- update progress,
- System Support events,
- XBFS changes,
- NOR changes,
- shutdown/reset.

---

# 12. Experiment matrix

## Series SSD/XBFS

For each console:

- original SSD identify + SMART,
- GPT export,
- XBFS full dump x2,
- System Support capture,
- live POST log,
- optional safe NOR dump x2,
- one controlled event/update,
- repeat captures,
- automated diff.

## Series multi-console

Need several known-good units for comparison:

- same model / similar build where possible,
- record exact revisions,
- do not compare only raw files and assume every difference is meaningful.

## Xbox One eMMC

For FAT / S / X separately:

- verify acquisition profile,
- dump twice,
- hash compare,
- inventory partitions/structures,
- cross-console diff,
- before/after update diff where safe.

---

# 13. Data classification in reports

Every finding should be labelled:

- `CONFIRMED`
- `STRONG EVIDENCE`
- `HYPOTHESIS`
- `UNKNOWN`

Examples:

- XBFS is 1 GB on Series: public documented fact.
- A given byte range changes after an update in our repeated test: confirmed for that test set.
- A byte range is a `pairing key`: hypothesis until decoded/validated.
- Exact SBFS mapping in the Series SPI NOR: unknown until proven.

---

# 14. MVP priorities

## Xbox Lab 1.0.1 experimental

Priority order:

1. SSD detection + SMART + power-on hours.
2. GPT/partition inventory.
3. Full 1 GB XBFS dump + SHA-256.
4. XBFS extraction/inventory.
5. Console serial/certificate parser with honest validation states.
6. Full `System Support` collector.
7. Automatic log/error parser.
8. Case report.
9. BEFORE/AFTER comparator.
10. Safe NOR/SPI acquisition once hardware method is proven.
11. Recovery package export.
12. Replacement SSD creator after enough real-console validation.

## Modi Flasher RP2350

Priority order:

1. RP2350 transport + robust USB protocol.
2. Xbox 360 existing modes.
3. UART/logger mode.
4. Series POST/AARDVARK mode.
5. SPI NOR read mode with board profiles.
6. Xbox One family eMMC read-only mode.
7. Only later: validated write/restore functions.

---

# 15. Marketing / public release rule

Do not publish claims such as:

- `first in the world`,
- `any SSD works`,
- `one-click repair of every Series`,
- `we decoded the pairing key`,

until independently verified.

A safe early public message is:

> **Make a recovery backup while your Xbox Series still works. Xbox Lab preserves the console-specific storage data and diagnostic evidence that may be needed after a future SSD failure.**

The stronger `Create Replacement SSD` claim should be used only after repeated successful recovery tests on real consoles.

---

# 16. Immediate next tests

1. Finish/read two identical XBFS dumps from the same Series SSD and confirm hash equality.
2. Extract inventory and parse serial/certificate/log candidates.
3. Capture full System Support and build automated parser.
4. Identify exact Series SPI/NOR IC from board marking and datasheet before any write attempt.
5. Capture repeatable NOR dumps if electrically safe.
6. Test BEFORE/AFTER update diffs on XBFS + logs + NOR.
7. Build a non-destructive `Recovery Backup` package.
8. Only after that, test `Create Replacement SSD` on a sacrificial/known-compatible SSD.
9. Prototype RP2350 universal hardware with protected selectable interfaces.
10. Add Xbox One family eMMC READ-ONLY research profiles.

---

# 17. Existing project documents

Read together with:

- `AGENT_DIAGNOSTIC_PROMPT.md`
- `DUMP_ANALYSIS_PROMPT.md`
- `RESEARCH_2026-10-09.md`
- `SERIES_X_WIRING_RESEARCH.md`

This roadmap is the current consolidation point for the new recovery/flasher ideas discussed on 2026-10-09.
