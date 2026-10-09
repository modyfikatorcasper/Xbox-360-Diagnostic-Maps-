# Xbox Lab v1.0.1 — Xbox Series storage / XBFS / SBFS research notes

> Status: **EXPERIMENTAL / RESEARCH**  
> Scope: Xbox Series S / Xbox Series X  
> Goal: make Xbox Lab collect and expose useful service data automatically instead of producing only a blind raw dump.

## 1. Why this document exists

Xbox Lab already has/targets a workflow for dumping the dedicated ~1 GB Xbox boot-storage area from the Series NVMe. That area is **XBFS**. During service research we also identified a second, separate storage layer on Series consoles: **SBFS (Southbridge File System)**. We also want the tool to inspect the normal NVMe partitions (especially System Support / diagnostic data), collect logs, read NVMe SMART, parse console identity/certificates and create comparable reports.

The important design change for v1.0.1 is therefore:

**Do not stop at `dump 1 GB raw`. Turn the dump into an automatic diagnostic report.**

---

# 2. Storage layers we need to treat separately

## A. XBFS — Xbox Boot File System on Series NVMe

Public Xbox One Research documentation states that on Series S/X the logical XBFS size is:

- `0x40000000` bytes
- 1024 MiB / 1 GiB

Series S/X XBFS header candidates are documented at:

- `0x00000000`
- `0x18008000`

XBFS header magic is documented as `SFBX` (little-endian representation of the filesystem magic in the structure).

Useful known XBFS entries include:

- `certkeys.bin` — per-console SP/SMC boot capability certificate
- `smcerr.log` — dynamic SMC error log
- `sp_s.cfg` — static per-console SP config; contains the console certificate
- `smc_d.cfg` — dynamic SMC config
- `sp_d.cfg`
- `os_d.cfg`
- `smcfw.bin`
- `boot.bin`
- `update.cfg`
- `update2.cfg`
- `recovery.dat`
- additional XVD/system entries

Important Series quirk documented by Xbox One Research: when calculating a file start inside Series XBFS, `0x6000` may need to be subtracted from the calculated start offset. This must be verified against our own dumps before hard-coding assumptions.

## B. SBFS — Southbridge File System

Series consoles also have **SBFS**, separate from XBFS. Xbox One Research explicitly documents that SBFS is not transparently exposed to the OS.

Known SBFS header candidates:

- `0x10000`
- `0x11000`

Known magic:

- `SFBS`

Known page size:

- `0x1000`

Public documentation currently lists at least these SBFS files:

- `smcfw.bin`
- `psp1sp.bin` — marked per-console
- `speaker.bin`
- `smcerr.log` — marked per-console
- `smc_d.cfg` — marked per-console
- `certkeys.smc` — SMC boot capability cert, marked per-console

### U25 hypothesis / physical dump

On the Series X Southbridge board being researched, **U25** is the 3.3 V SPI NOR candidate being investigated as the physical storage containing SBFS or data associated with SBFS.

Current working pinout for the 8-pin 25-series SPI device:

| Pin | Signal |
|---:|---|
| 1 | CS# |
| 2 | MISO / DO |
| 3 | WP# |
| 4 | GND |
| 5 | MOSI / DI |
| 6 | CLK |
| 7 | HOLD# |
| 8 | VCC 3.3 V |

**Do not state `U25 == complete SBFS 1:1` as verified yet.**  
Verification test: raw-read U25 and check for `SFBS` at `0x10000` and/or `0x11000`, then try parsing it with `sbfs-tool`.

### Important real-world observation

Kacper has previously replaced a shorted complete Southbridge board with another donor board without moving U25, and the console booted and remained operational. Therefore we must not blindly assume U25/SBFS is permanently hard-paired in a way that always prevents board replacement.

Research hypotheses:

1. some SBFS data is per-console but can be provisioned/updated by the console;
2. only selected fields/files are paired;
3. donor compatibility matters;
4. the console may rewrite selected SBFS regions at boot/update;
5. some prior public repair assumptions about mandatory NOR transfer may be incomplete.

Test this empirically with BEFORE/AFTER dumps.

---

# 3. v1.0.1 target workflow

## Stage 1 — Acquire

Xbox Lab should create a case directory and collect, where available:

1. **Raw XBFS dump** (~1 GiB on Series)
2. **Parsed/extracted XBFS files**
3. **SBFS/U25 raw dump** (when physical programmer path is used)
4. **Parsed/extracted SBFS files**
5. **NVMe SMART / health data**
6. **GPT/partition map of the whole NVMe**
7. **System Support / diagnostic files and logs**
8. hashes of every source dump and extracted artifact

Read-only by default.

Recommended filenames:

```text
case-YYYYMMDD-HHMMSS/
  source/
    xbfs_raw.bin
    sbfs_u25_raw.bin
    nvme_smart.json
    partition_map.json
  xbfs/
    ...extracted files...
  sbfs/
    ...extracted files...
  system_support/
    ...selected logs...
  reports/
    summary.json
    summary.md
    diff.json
```

## Stage 2 — Validate source integrity

For physical/raw reads:

- request/read at least 2 dumps, preferably 3
- calculate SHA-256 for each
- require identical hashes before using the dump as trusted input
- if hashes differ: show **UNSTABLE READ — DO NOT WRITE**

For XBFS/SBFS:

- locate candidate headers
- validate magic
- show format version
- show sequence number
- show layout version
- validate stored header SHA-256 where format/tooling permits

---

# 4. Automatic console identity / certificate panel

## Console certificate from `sp_s.cfg`

Public Xbox One Research documentation describes the console certificate as:

- stored in `sp_s.cfg`
- certificate start offset inside `sp_s.cfg`: `0x5400`
- certificate size: `0x400`
- certificate magic: `CC`

Important fields inside the certificate:

| Relative offset | Field |
|---:|---|
| `0x010` | SoC ID (16 bytes) |
| `0x020` | Generation ID |
| `0x022` | Console Region |
| `0x230` | Console Serial Number (0x0C bytes) |
| `0x23C` | Console SKU (0x08 bytes) |
| `0x244` | Console Settings Digest (SHA-256) |
| `0x264` | Console Part Number (0x0C bytes) |
| `0x280` | RSA signature (0x180 bytes) |

### UI output

Xbox Lab should immediately display:

```text
Console Serial:        XXXXX...
Console SKU:           ...
Console Part Number:   ...
SoC ID:                ...
Generation ID:         ...
Region:                ...
Certificate structure: OK / INVALID
Signature verification: VERIFIED / FAILED / NOT IMPLEMENTED
```

**Important:** `magic/size/structure OK` is NOT the same thing as a cryptographically verified certificate. Until we implement signature-chain verification, the UI must not call it simply `Certificate Valid` without qualification.

Suggested UI statuses:

- `STRUCTURE OK`
- `STRUCTURE INVALID`
- `SIGNATURE VERIFIED`
- `SIGNATURE FAILED`
- `SIGNATURE NOT CHECKED`

## Boot capability certificate from `certkeys.bin`

Public docs describe `certkeys.bin` as a 0x400-byte per-console SP/SMC boot capability certificate.

Parse and display at least:

- magic / structure
- SoC ID
- Generation ID
- allowed states
- flags
- expiration fields
- minimum SP version
- minimum 2BL version
- capability entries
- signature-check state

This is useful for spotting mismatched/corrupt per-console metadata.

---

# 5. NVMe SMART panel

Xbox Lab should query NVMe health information from the physical SSD whenever the execution environment allows NVMe SMART/admin passthrough.

Minimum service-facing fields:

- Model
- SSD serial number
- Firmware revision
- Critical Warning
- Temperature
- Available Spare
- Available Spare Threshold
- Percentage Used
- Data Units Read
- Data Units Written
- Host Read Commands
- Host Write Commands
- Controller Busy Time
- **Power On Hours**
- Power Cycles
- Unsafe Shutdowns
- Media and Data Integrity Errors
- Error Information Log Entries

Primary UI item requested for service use:

**SSD Power-On Hours → show immediately in hours and converted days.**

Do not derive console total runtime from SSD POH without labeling it as SSD runtime/proxy; a replaced SSD resets this relationship.

---

# 6. Partition discovery — do not dump only XBFS

Xbox Lab should enumerate the whole physical disk GPT/partitions first and store a partition map.

For every partition/volume:

- GUID / type GUID
- start LBA
- end LBA
- byte size
- filesystem where recognizable
- volume label where recognizable
- mount/read status
- hash or metadata snapshot where practical

Known Xbox One/Series research references include a **System Support** volume used for system settings/temp/support data. Exact Series layouts and exposed drive letters may vary depending on environment, so Xbox Lab should discover by GUID/label/filesystem instead of assuming one fixed letter.

### System Support / diagnostic collection

Requested behavior:

1. identify the System Support / diagnostic partition or volume
2. mount/open **read-only**
3. recursively inventory files
4. copy only relevant diagnostic/log/config files into the case folder
5. preserve original paths, timestamps and hashes
6. parse known formats
7. keep unknown files for later research

Search candidates by names/extensions such as:

```text
*.log
*.etl
*.dmp
*.dmpx
*.txt
*.xml
*.json
*.cfg
*error*
*crash*
*update*
*blackbox*
```

Do not hard-code one guessed `errors` folder until we inspect real Series System Support samples. The collector should find candidates and record their full source paths.

---

# 7. Error/log panel

Xbox Lab should combine errors from multiple sources instead of showing one dump only.

Potential sources:

### XBFS
- `smcerr.log`
- `update.cfg`
- `update2.cfg`
- dynamic config (`smc_d.cfg`, `sp_d.cfg`, `os_d.cfg`)

### SBFS
- `smcerr.log`
- `smc_d.cfg`
- per-console metadata/cert files

### SSD normal partitions
- System Support / diagnostic folders
- discovered update/error/crash logs

### Output

Normalize findings into one table:

| Source | Timestamp | Raw code | Decoded name | Severity | Context | Confidence |
|---|---|---|---|---|---|---|

Keep the raw source file and raw code next to every decoded interpretation.

Useful public lookup/reference for POST/error research:

- https://errors.xboxresearch.com/

Do not treat community descriptions as Microsoft-authoritative; label provenance/confidence.

---

# 8. Automatic comparison engine

The project goal is not only dump extraction but repeatable A/B comparison.

## A. Same hardware, before vs after update

Highest-value comparison:

```text
same console / same SSD / same U25
BEFORE update
vs
AFTER update
```

Compare:

- raw XBFS
- extracted XBFS files
- XBFS sequence/layout versions
- raw SBFS/U25
- extracted SBFS files
- SBFS sequence/layout versions
- System Support logs
- SMART counters

This can reveal exactly what an update changes.

## B. Known-good vs failing console

Compare:

- fixed/common regions
- per-console regions
- dynamic regions
- update-sensitive regions
- structural corruption
- missing/zeroed/truncated files
- unexpected sequence/version mismatch

## C. Multiple consoles

With 3+ samples, classify regions/files as:

- `STATIC / COMMON`
- `PER-CONSOLE`
- `DYNAMIC`
- `UPDATE-DEPENDENT`
- `UNKNOWN`

Do not mark any offset as `per-console` from a single pair of samples.

---

# 9. Specific research question: Series update stuck around 94%

Current service case: console reportedly had the SSD replaced multiple times and repeatedly stalls around 94% during update.

Research plan:

1. collect full NVMe partition map
2. collect SMART and confirm SSD health counters
3. dump + parse XBFS
4. validate console certificate structure / serial / SoC data
5. extract XBFS `smcerr.log`, update config/log files
6. collect normal-partition System Support/update/error logs
7. raw-read U25/SBFS if possible
8. verify `SFBS` header candidate(s)
9. extract SBFS files
10. compare against at least one known-good Series board
11. if possible compare the exact same failing console before/after a failed update attempt
12. correlate differences with known POST / OS update error codes

Do not assume the 94% symptom is caused by U25/SBFS. Treat it as one testable hypothesis among SSD health, partition/layout, XBFS mismatch/corruption, update state, Southbridge state and other hardware causes.

---

# 10. U25 / SBFS provisioning experiment

Purpose: determine whether swapping/booting/updating a Southbridge board causes automatic writes to U25/SBFS.

Procedure:

1. dump donor U25 **before** installation — repeat 3x / confirm SHA-256
2. install donor Southbridge board
3. boot console
4. dump U25 again
5. compare raw and extracted SBFS
6. perform/update only if needed for the experiment
7. dump U25 again
8. map every changed block/file

Record:

- raw offsets changed
- file(s) containing changes
- header sequence number change
- SHA changes
- per-console fields changed or not changed

This is the cleanest way to test automatic provisioning rather than relying on repair folklore.

---

# 11. Recommended Xbox Lab dashboard for v1.0.1

```text
[XBOX LAB 1.0.1 — SERIES]

Console Identity
  Serial:                  ...
  SKU:                     ...
  Part Number:             ...
  SoC ID:                  ...
  Console Cert Structure:  OK / FAIL
  Console Cert Signature:  VERIFIED / FAILED / NOT CHECKED

SSD Health
  Model / FW:              ...
  SSD Serial:              ...
  Power-On Hours:          ... h (... days)
  Percentage Used:         ... %
  Unsafe Shutdowns:        ...
  Media Errors:            ...
  Critical Warning:        ...

XBFS
  Found:                   YES / NO
  Header:                  offset ...
  Sequence:                ...
  Layout:                  ...
  Header SHA:              OK / FAIL / UNKNOWN
  certkeys.bin:            FOUND / MISSING
  sp_s.cfg:                FOUND / MISSING
  smcerr.log:              FOUND / MISSING
  update.cfg:              FOUND / MISSING

SBFS / U25
  Dump available:          YES / NO
  SFBS magic:              YES / NO
  Header offset:           0x10000 / 0x11000 / none
  Sequence:                ...
  Layout:                  ...
  Header SHA:              OK / FAIL / UNKNOWN
  smcerr.log:              FOUND / MISSING
  certkeys.smc:            FOUND / MISSING

System Support / Logs
  Partition found:         YES / NO
  Files scanned:           ...
  Diagnostic candidates:   ...
  Parsed errors:           ...

Result
  [OK] / [WARNING] / [CRITICAL] / [RESEARCH NEEDED]
```

---

# 12. Useful public GitHub projects / documentation to fetch or inspect

## Core documentation

### Xbox One Research Wiki
- Repository: https://github.com/xboxoneresearch/wiki
- XBFS: https://github.com/xboxoneresearch/wiki/blob/master/docs/boot/xbox-boot-file-system.md
- SBFS: https://github.com/xboxoneresearch/wiki/blob/master/docs/boot/southbridge-file-system.md
- Certificates: https://github.com/xboxoneresearch/wiki/blob/master/docs/security/certificates.md
- Xbox OS / volumes: https://github.com/xboxoneresearch/wiki/blob/master/docs/operating-system/xbox-operating-system.md

## XBFS tools

### QuantumTunnel
- https://github.com/XboxOneResearch/QuantumTunnel
- documented by Xbox One Research as an XBFS dumping tool for SystemOS; requires elevated/NT SYSTEM style privileges in its documented environment

### xvdtool / XBFSTool
- https://github.com/emoose/xvdtool
- useful for XBFS/XVD-related parsing/extraction research

### xbfs-tool
- https://github.com/RetroTechCorner/xbfs-tool
- parsing/extraction/injection research for raw XBFS images

## SBFS

### sbfs-tool
- https://github.com/RetroTechCorner/sbfs-tool
- Go tool, experimental/WIP
- parses candidate `SFBS` headers
- checks header locations `0x10000` and `0x11000`
- extracts the initial `0x10000` bytes as `data.hdr`
- currently names/extracts `smcfw.bin`, `psp1sp.bin`, `speaker.bin`, `smcerr.log`, `smc_d.cfg`, `certkeys.smc`
- source also shows a sequence-number update path that recalculates a SHA-256 header checksum; **Xbox Lab v1.0.1 should use read/parse only until we deliberately implement writing**

## Disk / partition research

### xboxonehdd
- https://github.com/xboxoneresearch/xboxonehdd
- older Xbox One disk-layout tooling/documentation; useful as historical reference for partition labels/GUID concepts, not a guarantee that every Series layout is identical

## Additional community Series research lead

### XboxSeries
- https://github.com/Coolaid003/XboxSeries
- community research notes; treat as a lead and verify claims independently before using them as authoritative behavior

---

# 13. Safety / data-integrity rules

1. **Read-only default.**
2. Never auto-write XBFS, SBFS/U25 or partition tables.
3. Never auto-format a Series SSD.
4. Always preserve original raw dumps.
5. Hash every source file.
6. If repeated reads differ, stop analysis and flag unstable acquisition.
7. Separate `verified from public structure docs` from `our hypothesis` in UI and reports.
8. Never label a certificate `VALID` only because magic/size are correct; distinguish structural parse from cryptographic signature verification.
9. Never generalize `per-console` offsets from one sample.
10. Before any future write feature, require explicit backup + explicit user action + format-specific integrity checks.

---

# 14. Immediate implementation backlog for the agent

## P0 — next

- [ ] Add XBFS header detection and parser
- [ ] Extract known XBFS entries to named files
- [ ] Parse `sp_s.cfg` console certificate at `0x5400`
- [ ] Display Serial / SKU / Part Number / SoC ID / Generation / Region
- [ ] Parse `certkeys.bin`
- [ ] Add SHA-256 manifests
- [ ] Add NVMe SMART collector and show Power-On Hours immediately
- [ ] Add GPT/partition enumerator for the full Series SSD
- [ ] Add read-only System Support/log collector
- [ ] Add raw/log error inventory to the report

## P1

- [ ] Add SBFS raw parser compatible with known `SFBS` structure
- [ ] Detect candidate headers at `0x10000` and `0x11000`
- [ ] Extract `smcerr.log`, `smc_d.cfg`, `certkeys.smc`, etc.
- [ ] Add U25 raw-dump import mode
- [ ] Diff same console BEFORE/AFTER update
- [ ] Diff known-good vs failing console
- [ ] Classify static/per-console/dynamic/update-dependent regions

## P2 research

- [ ] Implement certificate RSA verification if the correct trust/issuer key path is established
- [ ] Decode more SMC/error log structures
- [ ] Correlate raw error codes with public error databases while preserving confidence/source
- [ ] Build automatic 94%-update-failure correlation report
- [ ] Run Southbridge/U25 provisioning experiment

---

# 15. Agent handoff instruction

When another model/agent continues this project:

- treat this file as the current research plan for **Xbox Lab v1.0.1**
- inspect the linked public repositories before reimplementing parsers
- reuse parsing concepts, but review licenses before copying code
- preserve the read-only-first rule
- mark every field as either `verified`, `community-documented`, `observed by us`, or `hypothesis`
- prefer evidence from raw dumps and repeatable comparisons over forum assumptions
- update this document with every new confirmed offset, filename, signature, error structure or experiment result
