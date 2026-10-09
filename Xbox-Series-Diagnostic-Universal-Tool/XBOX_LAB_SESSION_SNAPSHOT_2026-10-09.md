# Xbox Lab — session snapshot — 2026-10-09

Status: EXPERIMENTAL / RESEARCH

This file records the current Xbox Series research direction and the concrete workshop workflow agreed during the 2026-10-09 session.

## 1. Core direction

Xbox Lab should evolve from a simple XBFS dump/format workflow into a combined **SSD recovery + Southbridge/U25 validation + diagnostic evidence** tool.

The target product concept is:

**Xbox Lab SSD Creator + U25/SBFS Validator**

The tool should not merely recreate an SSD. It should inspect both sides of the console state:

- SSD / XBFS,
- Southbridge SPI NOR / U25 / possible SBFS content,
- System Support / update logs,
- SMART / SSD identity,
- console-specific identifiers and certificate-related files,
- live/POST evidence where available.

## 2. Existing public tooling / reuse policy

Public tools already show that Series XBFS can be parsed and SSD media can be prepared/recovered without inventing every format from scratch.

Current useful references:

- `emoose/xvdtool` — public source, XBFS/Xbox Series support, GPLv2. If code is reused/derived, preserve GPLv2 obligations, source availability and attribution.
- `RetroTechCorner/xbfs-tool` — reference implementation / behavior reference.
- XBFSTOOL / XBFS Export Tool — useful behavior reference for Series SSD preparation/backup/restore.

Do **not** take a closed third-party binary and simply rename/repackage it. Use public source/reference behavior and implement Xbox Lab's own validation layer.

## 3. Why U25 / Southbridge validation matters

Current working hypothesis:

Existing SSD formatter/recovery workflows appear to operate on XBFS/SSD data but do not publicly document reading or validating the Southbridge SPI NOR/U25 side.

Therefore one possible reason a rebuilt/clone SSD can still fail is that the workflow is blind to another state store.

Research question:

- Is there data in U25/Southbridge that must correlate with data present in XBFS?
- Are there duplicated identifiers, counters, state/version fields, hashes, certificates, key-related metadata, update state, or provisioning information?
- Can a mismatch explain some update loops or donor-SSD failures?
- Does the console rewrite/provision any U25/SBFS state after board swap/update?

Do not label an offset as pairing/key/certificate state until evidence proves it.

## 4. Required Xbox Lab SSD Creator flow

Proposed high-level flow:

1. Detect source SSD.
2. Read SMART / health / power-on hours where available.
3. Export GPT / layout metadata.
4. Dump the full 1 GB XBFS twice.
5. Require matching SHA-256 hashes before accepting the image.
6. Parse XBFS inventory.
7. Surface at minimum:
   - `sp_s.cfg`,
   - `certkeys.bin`,
   - `smcerr.log`,
   - `update.cfg`,
   - `update2.cfg`,
   - dynamic cfg files,
   - System Support/update logs when accessible.
8. Parse console serial where reliably supported.
9. Distinguish certificate states: present / parseable / cryptographically verified / invalid / unknown.
10. Read U25/SPI NOR using a board-specific safe profile.
11. Take two independent NOR reads and require identical hashes.
12. Inspect for known/public filesystem signatures/structures; treat SBFS mapping as unconfirmed until verified on real dumps.
13. Cross-check any demonstrably shared data between XBFS and U25/SBFS.
14. Create replacement SSD only after required console-specific state has been preserved and validated.
15. Verify the written SSD against the prepared image.
16. Record first-boot/update evidence and compare it with pre-recovery state.

Suggested result states:

- `READY`
- `WARNING`
- `BLOCKED`
- `U25_NOT_READ`
- `U25_READ_UNVERIFIED`
- `XBFS_INTEGRITY_WARNING`
- `XBFS_SBFS_MISMATCH_SUSPECTED`
- `CONSOLE_SPECIFIC_DATA_MISSING`

## 5. Test case 01 — update loop around 94%

Known workshop case:

- console repeatedly reaches approximately 94% of the update and loops/fails,
- storage has reportedly been replaced multiple times,
- exact root cause is not yet proven.

Before further modification, capture:

- SSD identify,
- SMART / POH,
- GPT metadata,
- XBFS x2,
- full XBFS inventory,
- System Support folder/logs,
- update logs,
- `smcerr.log`,
- POST/runtime evidence where available,
- U25 NOR x2,
- OS/build/update state.

Then compare BEFORE vs AFTER a controlled update attempt.

## 6. Test case 02 — update loop with network-style behavior

Second known workshop console:

- console boots,
- update loops differently,
- behavior appears as if update cannot connect to the Internet / discovery does not proceed correctly.

Interesting public research clue:

A documented Xbox Series update case showed Windows Update starting before network availability, returning `0x8024402C`; when network became available a few seconds later, discovery did not automatically recover. This is only a clue/hypothesis for Case 02, not proof.

Required controlled tests:

1. Full snapshot before any repair/write.
2. Cold boot with wired network already live before console power-on.
3. Capture update/System Support logs.
4. If appropriate, compare official offline update behavior.
5. Compare pre/post XBFS and U25 state.
6. Record whether offline succeeds while online fails.

If offline succeeds and online fails, prioritize update/network state investigation before blaming SSD or U25.

Potential parser labels:

- `NETWORK_UNAVAILABLE_AT_DISCOVERY`
- `LATE_NETWORK_AVAILABILITY`
- `UPDATE_DISCOVERY_NOT_RETRIED`

## 7. Permanent workshop harness concept

The goal is to avoid repeated soldering during iterative experiments.

Concept:

- leave a small set of wires permanently soldered to the relevant SPI/NOR points on the test console,
- route them to a small service connector or directly to an RP2350/Pico 2 service module,
- keep the flasher electrically inactive during normal console operation,
- after an update/failure/shutdown, acquire another NOR dump immediately without re-soldering,
- correlate the NOR change with XBFS/System Support/POST changes.

### Important electrical correction

**Switching only RP2350 VCC is not automatically sufficient.**

If an unpowered MCU remains connected to active target SPI lines, the target can sometimes back-power the MCU through input protection/ESD structures. Therefore the design should allow the wires to remain physically connected while keeping the interface electrically isolated/high-impedance when inactive.

Preferred direction:

- default-off bus isolation / high-impedance state on SPI signal lines,
- explicit enable only during an intentional dump,
- safe handling of VCC/reference domains,
- no accidental target powering from the flasher,
- no accidental flasher powering from the target through I/O.

Possible implementation approaches to evaluate:

- service connector + unplugged flasher,
- bus switch / analog switch with default OFF,
- level translator/buffer with OE held disabled by default,
- per-line series resistance where electrically appropriate,
- separate target-VCC sensing and power-domain detection.

The exact circuit must be selected only after the U25 chip, voltage, board topology and in-circuit behavior are confirmed.

### Wire length / signal integrity

Longer service wires may be practical, but they are not electrically irrelevant.

For SPI/NOR:

- keep wires as short as practical,
- keep a solid ground/reference path,
- avoid large loops,
- reduce SPI clock if using a longer harness,
- validate repeated reads at the selected cable length,
- require identical hashes before accepting a dump,
- only increase speed after stable repeated reads are proven.

The test harness should favor reliability over maximum clock speed.

## 8. RP2350 / Pico 2 role

RP2350/Pico 2 remains the preferred new hardware base for the experimental service interface.

Desired modes:

- Xbox 360 NAND,
- Xbox 360 4 GB eMMC,
- Xbox One-family eMMC read-only research,
- SPI NOR/U25 read mode,
- UART/logger mode,
- Xbox Series POST/AARDVARK mode where appropriate,
- future board-specific buses.

For the Xbox Series U25 workflow, first implementation remains **READ ONLY**.

## 9. NOR experiment protocol

For every controlled experiment:

1. Power state verified safe for the chosen read method.
2. `NOR_BEFORE_1.bin`
3. `NOR_BEFORE_2.bin`
4. SHA-256 compare; if different, stop and fix acquisition reliability.
5. Controlled event: boot/update/network test/board swap depending experiment.
6. Shut down / move to validated safe acquisition state.
7. `NOR_AFTER_1.bin`
8. `NOR_AFTER_2.bin`
9. SHA-256 compare.
10. Binary diff BEFORE vs AFTER.
11. Correlate changed ranges with:
    - XBFS diff,
    - System Support timeline,
    - update stage,
    - POST/errors,
    - OS build.

Across multiple consoles, classify regions as:

- stable/common,
- per-console candidate,
- dynamic/update-state candidate,
- donor/provisioning candidate,
- unknown.

## 10. Immediate lab priority

When returning to testing:

1. Do not write U25 yet.
2. Build/prepare reliable permanent service harness.
3. Validate two identical U25 reads on each console.
4. Capture complete XBFS/System Support/SMART snapshot.
5. Run Case 01 and Case 02 as separate controlled experiments.
6. Preserve every pre/post image with hashes and timestamps.
7. Feed all results into the Xbox Lab comparator.
8. Only after repeated evidence decide whether any U25 refresh/rewrite operation is justified.

## 11. Current hypothesis discipline

Keep these statements separate:

- CONFIRMED: XBFS can be captured and parsed; public tools support Series storage workflows.
- STRONG EVIDENCE: existing public SSD formatter workflows do not publicly document U25/SBFS validation.
- HYPOTHESIS: U25/SBFS may contain state that must correlate with XBFS for some recovery/update scenarios.
- HYPOTHESIS: some update-loop failures may involve stale or mismatched Southbridge-local state.
- UNKNOWN: exact fields/offsets and whether any specific field should ever be refreshed or rewritten.

No U25 write/refresh feature should be enabled until a repeatable, backed-up, reversible procedure is proven on test hardware.
