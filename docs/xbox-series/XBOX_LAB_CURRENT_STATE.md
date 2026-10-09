# Xbox Lab — current state

Status: **experimental / research**  
Current app version: **1.0.1**  
Scope: Xbox Series X / Series S storage, diagnostics, Southbridge and replacement-SSD research.

## 1. Southbridge SPI NOR U25

Working identification for the Series X Southbridge board under test:

- reference: `U25`
- type: 8-pin 25-series SPI NOR
- supply: **3.3 V**
- working pinout:
  - 1 = CS#
  - 2 = MISO / DO
  - 3 = WP#
  - 4 = GND
  - 5 = MOSI / DI
  - 6 = CLK
  - 7 = HOLD#
  - 8 = VCC 3.3 V

The accessible Toledo SB schematic shows SPI routing between the SMC side and FACET/programming side. Do not assume that U25 content is already fully understood.

### U25 research workflow

For each board:

1. perform 2–3 raw reads;
2. calculate SHA-256 for each;
3. trust a dump only when all reads are identical;
4. never write anything while the structure is not understood;
5. compare known-good, failing and before/after-update dumps;
6. detect fixed regions, per-console data, dynamic/update-dependent regions, strings, headers, FF/00 regions, entropy changes and probable checksums.

Important service observation: a complete shorted Southbridge board has previously been replaced by a donor board without moving U25 and the console still booted and remained operational. Therefore hard permanent pairing must not be assumed without evidence.

## 2. SBFS hypothesis

Public Xbox research documents a Southbridge File System (SBFS), separate from XBFS.

Known candidates to test in a U25 dump:

- magic: `SFBS`
- candidate headers: `0x10000`, `0x11000`
- page size: `0x1000`

Publicly described SBFS entries include items such as:

- `smcfw.bin`
- `psp1sp.bin`
- `speaker.bin`
- `smcerr.log`
- `smc_d.cfg`
- `certkeys.smc`

Working rule: **do not state that U25 equals the complete SBFS until a real dump confirms it.** First search for `SFBS`, then attempt parsing with available public tooling.

## 3. XBFS / ~1 GiB Series boot-storage area

Xbox Lab already targets the Series XBFS raw area and must go beyond blindly saving a 1 GiB dump.

The application should automatically extract and analyze known entries where present, including:

- `certkeys.bin`
- `sp_s.cfg`
- `smcerr.log`
- `smc_d.cfg`
- `sp_d.cfg`
- `os_d.cfg`
- `smcfw.bin`
- `boot.bin`
- `update.cfg`
- `update2.cfg`
- `recovery.dat`

## 4. Console identity / certificate panel

Xbox Lab should expose immediately after parsing:

- console serial number
- SKU
- part number
- SoC ID
- generation ID
- region
- certificate structure state
- signature verification state when implemented

Known working target is the console certificate inside `sp_s.cfg`.

The UI must distinguish:

- structure valid
- structure invalid
- signature verified
- signature failed
- signature not checked

Never label a certificate simply "valid" if only the file structure/magic was checked.

## 5. SSD SMART / service information

Read and display, when supported by the host adapter/environment:

- SSD model
- SSD serial
- firmware revision
- temperature
- Critical Warning
- Available Spare
- Percentage Used
- Data Units Read/Written
- Host Reads/Writes
- Controller Busy Time
- **Power On Hours**
- Power Cycles
- Unsafe Shutdowns
- Media/Data Integrity Errors
- Error Information Log Entries

Power On Hours must be shown in both hours and converted days. Treat it as **SSD runtime / proxy**, not guaranteed total console runtime.

## 6. Whole-disk / hidden-partition research

Do not limit analysis to the single XBFS area.

Xbox Lab should first enumerate the complete NVMe layout and save:

- GPT/partition map
- partition GUIDs/type GUIDs
- start/end LBA
- sizes
- recognizable filesystems/labels
- mount/read status

Special focus: System Support / diagnostic data and any other hidden or non-obvious partitions/regions.

The program should automatically inventory and copy relevant logs/configs read-only, keeping original paths, timestamps and hashes.

Candidate file classes/names:

- `*.log`
- `*.etl`
- `*.dmp`
- `*.dmpx`
- `*.txt`
- `*.xml`
- `*.json`
- `*.cfg`
- names containing `error`, `crash`, `update`, `blackbox`

Do not hard-code one guessed folder until real Series samples confirm exact paths.

## 7. Unified error/log parser

Combine findings from:

- XBFS
- SBFS/U25
- System Support / normal NVMe partitions
- SMART/NVMe error information

Normalize to one diagnostic table with:

- source
- timestamp
- raw code
- decoded name
- severity
- context
- confidence

Always retain the original source file and raw code beside any decoded interpretation.

## 8. Comparison engine

Highest-priority comparison:

**same console + same SSD + same U25, before update vs after update**.

Also compare:

- known-good vs failing console
- multiple consoles (3+ samples)

Classify regions/files only after enough samples as:

- STATIC / COMMON
- PER-CONSOLE
- DYNAMIC
- UPDATE-DEPENDENT
- UNKNOWN

Do not classify an offset as per-console from only one comparison pair.

## 9. Update-stuck-around-94% case

Current research case: Series console repeatedly stalls around 94% during update and reportedly had SSD replacement attempts.

Diagnostic collection should include:

1. full partition map;
2. SMART/NVMe health;
3. raw + parsed XBFS;
4. certificate/identity state;
5. `smcerr.log`, update configs and other dynamic logs;
6. System Support/update/error logs;
7. U25 raw dump when possible;
8. SBFS detection/parsing if present;
9. comparison against a known-good board;
10. same-console before/after failed-update diff if possible.

Do not assume U25/SBFS is the cause. Treat it as one hypothesis among SSD health, partition/layout corruption, XBFS mismatch, stale update state, Southbridge state and other hardware causes.

## 10. Provisioning experiment

Goal: determine whether installing/booting/updating a donor Southbridge board causes automatic modification of U25/SBFS.

Procedure:

1. dump donor U25 before installation (3 identical reads);
2. install donor Southbridge board;
3. boot console;
4. dump U25 again;
5. compare raw and parsed content;
6. perform update only if needed;
7. dump again;
8. map every changed block/file/sequence/header.

This experiment is intended to determine whether per-console data can be provisioned or rewritten automatically.

## 11. New SSD / replacement-drive builder concept

Research goal: build a reliable workflow for preparing a **new Xbox Series SSD** instead of blindly cloning an entire donor disk.

Required questions:

- Is there a complete Series-specific partition-creation tool already available?
- Which GPT partitions and hidden regions are truly mandatory?
- Which data is generic and can be recreated from public/update content?
- Which data is per-console and must be migrated from the original console?
- Which files/regions can be regenerated by the console itself?
- Which areas can be omitted in a minimal recovery image?

Planned modes:

### A. Full clone

Sector-for-sector clone of a known-good original disk. Lowest research risk but requires a source image and same-or-larger target.

### B. Rebuild from layout

Create GPT/required partitions on a blank SSD, then populate generic system data plus the console-specific content recovered from the original drive.

### C. Minimal recovery image

Research whether a much smaller reusable image can contain only the mandatory Series boot/update structure, with per-console files injected afterward.

### D. Web/desktop workflow target

Long-term service workflow:

1. connect original SSD;
2. Xbox Lab automatically identifies console-specific data and required partitions;
3. export a compact migration package;
4. connect replacement SSD;
5. create the correct Series layout;
6. restore only mandatory generic + per-console data;
7. verify hashes/structure/certificates;
8. produce a report saying whether the replacement disk is ready for the console.

Until mandatory structures are proven, default mode stays **read-only / analysis first**.

## 12. Target Xbox Lab 1.0.1 dashboard

Main sections:

- Console Identity
- SSD Health
- XBFS
- SBFS / U25
- Partitions / System Support
- Parsed Errors
- Compare / Diff
- Replacement SSD Research

Overall result states:

- OK
- WARNING
- CRITICAL
- RESEARCH NEEDED

## 13. Public research/tooling references to keep available to the agent

Primary research source family:

- Xbox One Research wiki/repository
- XBFS documentation
- Southbridge File System documentation
- certificate documentation
- Xbox OS/volume documentation

Useful tooling/references already noted for later agent work:

- public XBFS tools/projects
- `sbfs-tool` or equivalent SBFS parser research
- `errors.xboxresearch.com` for community error-code lookup

All third-party/community interpretations must be labelled by provenance/confidence rather than treated as official Microsoft documentation.

---

## Current practical next steps

1. Acquire at least one known-good Series U25 dump and verify 3 matching reads.
2. Search for `SFBS` at documented candidate offsets.
3. Dump a second known-good board and the failing/update-stuck board.
4. Dump complete NVMe layout + SMART + System Support logs from each.
5. Build A/B diff reports.
6. Confirm exactly which files contain serial/certificate data and which are mutable.
7. Test Southbridge provisioning with before/after U25 dumps.
8. Only after that, start implementing the replacement-SSD builder/minimal recovery image.
