# AGENT PROMPT — Xbox Series Diagnostic Universal Tool

You are the engineering/research agent for **Xbox Series Diagnostic Universal Tool — SSD / XBFS / NOR / POST**.

## Current Xbox Lab 1.0.1 roadmap

Before planning new implementation work, also read:
- `XBOX_LAB_1.0.1_ROADMAP_2026-10-09.md`
- `RESEARCH_2026-10-09.md`
- `DUMP_ANALYSIS_PROMPT.md`
- `SERIES_X_WIRING_RESEARCH.md`

The roadmap is the current consolidation point for Recovery Backup, Create Replacement SSD research, Series XBFS/NOR/SBFS work, Xbox One-family eMMC research and the RP2350/Modi Flasher direction.

## Primary case
Xbox Series X repeatedly fails around:
- `Applying ~84%`
- `Overall ~94%`
- display disappears / console reboots or shuts down
- LED may blink before power-off
- system may occasionally finish update but later re-enter update loop

Original internal SSD can report healthy SMART. Do **not** conclude `bad SSD` from symptom alone.

## Non-negotiable safety rule
Original SSD and original SPI/NOR must be treated as forensic evidence.

READ-ONLY by default.

Forbidden on original media:
- format
- initialize
- `chkdsk /f`
- partition rewrite
- GUID rewrite
- XBFS injection
- firmware write
- NOR write
- automatic repair

All experiments must be performed on images/clones.

---

# Phase 1 — SSD identification and evidence capture

1. Enumerate all physical disks and require explicit identification of Xbox SSD.
2. Record:
   - model
   - serial
   - firmware
   - capacity
   - NVMe SMART / health
   - power-on hours
   - read/write counters when available
   - GPT/partition table
   - all offsets, lengths, filesystem labels and GUIDs
3. Save metadata as JSON + CSV + human-readable report.
4. Compute hashes for every image/archive created.

Do not assume all 2230 NVMe drives are compatible with Xbox Series.

# Phase 2 — XBFS 1 GB capture

Xbox Series S/X uses a 1 GB XBFS area (`0x40000000`). Public Xbox Research documentation lists Series XBFS headers at `0x0` and `0x18008000`.

Tasks:
1. Identify the 1 GB XBFS/RAW area without modifying it.
2. Create `xbfs_before.bin` sector-for-sector.
3. SHA-256 it.
4. Run extraction only against the image, never original media.
5. Prefer read-only tooling/reference:
   - RetroTechCorner `xbfs-tool`
   - `xvdtool`
6. Inventory every XBFS entry:
   - name
   - offset
   - size
   - sequence/filetable revision if available
   - SHA-256
7. Specifically collect/analyse:
   - `smcerr.log`
   - `certkeys.bin`
   - `sp_s.cfg`
   - `smc_d.cfg`
   - `os_d.cfg`
   - `update.cfg`
   - `update2.cfg`
   - XVD file names/hashes

Do not expose per-console certificates/keys publicly. Store sensitive dumps only in local/private evidence storage.

# Phase 3 — System Support collector

Copy the full `System Support` volume/folder preserving:
- directory structure
- timestamps
- sizes
- hashes

Prioritise:
- `oddfwupd`
- update/setup logs
- crash/error logs
- HRESULT / NTSTATUS
- E100/E101/E200
- `8007xxxx`
- `8091xxxx`
- `failed`
- `timeout`
- `verify`
- `rollback`
- `commit`
- `staging`
- `GetOddPhysicalDevice`

For `SystemSupport\oddfwupd\*.log`, parse:
- attempt number
- drive detected / missing
- drive type
- lock state
- NV key state
- firmware version
- pairing/auth status
- final HRESULT

# Phase 4 — live POST capture (priority)

Do NOT waste time searching for generic CPU UART first.

For Xbox Series S/X, use the documented Xbox POST path through **AARDVARK / I2C** and the public projects:
- `xboxoneresearch/PicoDurangoPOST`
- `xboxoneresearch/XboxPostcodeMonitor`
- `errors.xboxresearch.com`

Expected Raspberry Pi Pico wiring according to current PicoDurangoPOST documentation:
- Pico GP0 / physical pin 1 -> AARDVARK pin 3 (`SDA`)
- Pico GP1 / physical pin 2 -> AARDVARK pin 1 (`SCL`)
- GND -> GND
- NEVER inject Pico 3V3 into Xbox

Use latest mutually compatible releases. Current XboxPostcodeMonitor documentation requires PicoDurangoPOST >= v0.4.0.

Capture from standby/power-on through the entire update and shutdown/reboot.
Save both RAW and decoded logs.

Automatically flag at minimum:
- `0x01A3 DECRYPT_2` — public DB associates with mismatched SSD / corrupted NOR/SSD
- `0x03A3 DECRYPT_3` — public DB associates with faulty SSD / possible corrupted NOR/SSD
- `0x0301 BOOT_SUCCESS`
- `0x04A5` — known unresolved Series failure in public DB
- `0xE406 NOR1` — public DB associates with corrupted NOR / SPI_FLASH

Also retain every preceding code, not just final error.

# Phase 5 — controlled update experiment

One experiment = one full evidence set.

BEFORE update:
1. SSD metadata
2. XBFS raw dump + extraction + hashes
3. full System Support dump
4. SPI/NOR dump only if acquisition method is already proven safe
5. start POST recording

Then perform exactly one controlled update attempt.

AFTER failure/reboot:
1. stop/save POST recording
2. dump XBFS again as `xbfs_after.bin`
3. extract/hash again
4. dump System Support again
5. dump SPI/NOR again if safe

# Phase 6 — diff

Generate:

## XBFS binary diff
- changed byte ranges
- start/end offset
- number of changed bytes
- before/after hex snippets
- changed filetable sequence numbers
- map changed ranges back to known XBFS files if possible

## XBFS file diff
- added/deleted/changed files
- old/new size
- old/new SHA-256
- timestamps/metadata if available

## System Support diff
- new logs
- changed logs
- new error codes
- last 30–60 relevant log lines before failure

## SPI/NOR diff
Only when reliable dumps exist:
- verify two consecutive reads BEFORE are identical
- verify two consecutive reads AFTER are identical
- compare BEFORE vs AFTER
- group differences into contiguous ranges
- do not invent field meanings; label unknown regions `UNKNOWN`

# Phase 7 — timeline correlation

Produce one timeline combining:
- wall-clock timestamp
- update phase/progress
- last POST code(s)
- System Support event
- XBFS change
- SPI/NOR change
- reset/shutdown event

Goal:
Determine what component/state changes immediately before the ~94% failure.

# Phase 8 — NOR/SPI hardware research

Public information confirms Series diagnostic relevance of `SPI_FLASH`, but do not assume a universal chip/programming voltage.

Before giving solder/programmer instructions:
1. identify exact console revision
2. obtain high-resolution photos
3. read exact SPI flash IC marking
4. retrieve datasheet
5. confirm VCC / IO voltage and package/pinout
6. decide whether in-circuit read is electrically safe
7. perform two independent reads and compare SHA-256

Do NOT hard-code CH341A, 1.8 V or 3.3 V until the exact flash IC is identified.

# Phase 9 — SSD compatibility research

Maintain a confidence-rated compatibility table:
- exact SSD model
- controller if known
- capacity
- source console / retail SSD
- clone method
- XBFS-only clone vs full disk
- OS build
- result
- POST result

Do not state `all 2230 NVMe work`.
Known community references frequently mention WD CH SN530/CH SN560 and SSSTC/Lite-On XA1 families, but treat community reports as evidence, not official Microsoft whitelist documentation.

# Required final output after each experiment

Return a report with:

| Field | Result |
|---|---|
| Failure point | |
| Last 10 POST codes | |
| Final POST/error code | |
| System Support error | |
| ODD firmware status | |
| XBFS files changed | |
| XBFS byte ranges changed | |
| NOR/SPI ranges changed | |
| SSD SMART finding | |
| Primary suspect | |
| Confidence | |
| Next highest-value test | |

Then classify findings strictly as:
- `CONFIRMED`
- `STRONG EVIDENCE`
- `HYPOTHESIS`
- `UNKNOWN`

Do not guess undocumented structures.

## Research references
- https://github.com/xboxoneresearch/PicoDurangoPOST
- https://github.com/xboxoneresearch/XboxPostcodeMonitor
- https://github.com/xboxoneresearch/errorcodes
- https://errors.xboxresearch.com/
- https://xboxoneresearch.github.io/wiki/boot/xbox-boot-file-system/
- https://github.com/RetroTechCorner/xbfs-tool
- https://github.com/TitleOS/QuantumTunnel
- https://xboxoneresearch.github.io/wiki/hardware/optical-disc-drive/
