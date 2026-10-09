# Xbox Lab — SSD Creator + U25/SBFS Validation Plan — 2026-10-09

Status: **EXPERIMENTAL / RESEARCH**

## Decision

Build our own **Xbox Lab SSD Creator** instead of simply rebranding another closed binary.

The tool should combine:

1. Xbox Series SSD/XBFS preparation and restore,
2. console-specific data extraction,
3. U25/SPI NOR acquisition,
4. SBFS parsing when confirmed on real hardware,
5. XBFS <-> U25/SBFS cross-validation,
6. SMART / power-on hours / serial / certificate / error-log analysis,
7. a clear recovery report before any destructive write.

## Important upstream distinction

Do **not** assume the Uber Micro / RealModScene SSD formatter binary is the same thing as the open-source `emoose/xvdtool` project.

Use closed tools as behavioural/reference material only unless source code and a compatible license are explicitly available.

A strong open-source base is:

- https://github.com/emoose/xvdtool

Its `XBFSTool` / `LibXboxOne` code already contains Xbox Series XBFS support, including an `XboxSeries` flavor and known XBFS entries such as:

- `certkeys.bin`
- `smcerr.log`
- `sp_s.cfg`
- `smc_s.cfg`
- `smc_d.cfg`
- `sp_d.cfg`
- system/update XVD entries

Related research references:

- https://github.com/xboxoneresearch/wiki/blob/master/docs/boot/xbox-boot-file-system.md
- https://github.com/RetroTechCorner/xbfs-tool
- https://github.com/TitleOS/QuantumTunnel

## License rule

`emoose/xvdtool` ships under **GNU GPL v2**.

If Xbox Lab directly forks, modifies, incorporates or distributes derivative GPLv2 code, preserve the required GPLv2 obligations, notices, source availability and attribution.

Do not remove upstream credits or present modified upstream code as wholly original.

If we want a proprietary core later, keep GPL tooling as a separate process/backend and have our own application communicate with it through a clearly separated interface, subject to a proper license review before release.

## Proposed architecture

```text
Xbox Lab
 |
 +-- SSD Detector
 |    +-- model / firmware / capacity
 |    +-- SMART
 |    +-- power-on hours
 |    +-- destructive-target safety check
 |
 +-- XBFS Engine
 |    +-- dump 1 GB XBFS x2
 |    +-- SHA-256 verification
 |    +-- parse file table
 |    +-- extract known entries
 |    +-- serial / certificate metadata
 |    +-- logs / update state
 |
 +-- SSD Creator
 |    +-- create required disk layout
 |    +-- restore verified XBFS
 |    +-- verify target after write
 |    +-- support controlled 512 GB / 1 TB workflows only after validation
 |
 +-- U25 / SPI NOR Reader
 |    +-- exact chip profile
 |    +-- safe voltage/profile selection
 |    +-- dump x2
 |    +-- SHA-256 verification
 |
 +-- SBFS Analyzer
 |    +-- detect expected structure/signature
 |    +-- parse known files when confirmed
 |    +-- inventory / diff
 |
 +-- Cross Validator
 |    +-- XBFS identity
 |    +-- U25/SBFS identity
 |    +-- per-console data correlation
 |    +-- BEFORE/AFTER comparison
 |    +-- donor/board-swap comparison
 |
 +-- Recovery Report
      +-- READY
      +-- WARNING
      +-- BLOCKED
      +-- UNKNOWN
```

## Core idea that differentiates Xbox Lab

Existing SSD format/restore workflows appear to operate on the SSD/XBFS side.

Xbox Lab should add a second evidence source: **U25 / Southbridge flash / SBFS**.

The goal is to test whether failed recovery cases are caused by data/state that a normal XBFS-only formatter never validates.

Do not state this as proven until repeated A/B tests confirm it.

## Validation workflow before writing a replacement SSD

1. Identify source SSD.
2. Read SMART and device identity.
3. Dump XBFS twice.
4. Require identical SHA-256.
5. Parse XBFS inventory.
6. Parse `sp_s.cfg`, `certkeys.bin`, `smcerr.log` and other known entries.
7. Read U25/SPI NOR twice when the hardware profile is verified safe.
8. Require identical SHA-256.
9. Detect/parse SBFS only if the real dump confirms the expected structure.
10. Cross-correlate XBFS vs U25/SBFS data.
11. Generate a pre-write report.
12. Only then enable `Prepare Replacement SSD`.
13. Recreate the validated disk structure.
14. Restore XBFS.
15. Verify written data byte-for-byte/hash-for-hash.
16. Boot/update using the correct recovery process.
17. Capture System Support / POST / updated XBFS / updated U25 for comparison.

## UI status proposal

### Console identity
- Serial number
- XBFS certificate: present / parseable / verified / invalid / unknown
- XBFS hash
- U25 hash
- SBFS: detected / not detected / unsupported / parse error

### SSD
- model
- firmware
- capacity
- SMART health
- power-on hours

### Compatibility / recovery
- `XBFS BACKUP: OK`
- `U25 BACKUP: OK / NOT READ`
- `SBFS PARSE: OK / UNKNOWN`
- `CROSS-VALIDATION: MATCH / MISMATCH / NOT ENOUGH DATA`
- `REPLACEMENT SSD: READY / WARNING / BLOCKED`

The program must not claim `MATCH` until we know which fields really should correspond.

## First A/B experiments

### Test A — same console, same SSD
- XBFS dump x2
- U25 dump x2
- boot/update
- XBFS dump x2 again
- U25 dump x2 again
- automated diff

### Test B — replacement SSD
- known-good original console
- verified XBFS backup
- verified U25 backup
- prepare replacement SSD
- restore XBFS
- compare boot/update result
- capture new System Support / POST evidence

### Test C — donor Southbridge board
- dump donor U25 before installation
- install donor board in controlled test unit
- boot/update
- dump donor U25 again
- compare before/after

This test may reveal whether board-local state is provisioned or rewritten. It is currently a hypothesis only.

## Naming

Working product/module names:

- **Xbox Lab SSD Creator**
- **Xbox Lab Series Recovery**
- **Xbox Lab U25/SBFS Validator**

Recommended UI sequence:

```text
Analyze Console
 -> Backup XBFS
 -> Backup U25
 -> Validate Console Data
 -> Prepare Replacement SSD
 -> Verify SSD
 -> Recovery / Update
 -> Compare After Recovery
```

## Release rule

Do not market this as a universal fix until validated on multiple Series X and Series S consoles, multiple SSD models and multiple OS builds.

Public claim should initially be conservative:

> Xbox Lab prepares and verifies Xbox Series recovery data from both the SSD/XBFS side and, where supported, the Southbridge flash side before creating a replacement SSD.

