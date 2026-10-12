# Xbox Series Diagnostic Universal Tool — public-research addendum
**Recorded:** 2026-10-12  
**Scope:** Xbox Series X/S — NVMe/SSD, XBFS, SBFS/U25 SPI NOR, POST/I²C, update/ODD logs, Dev Mode ETL, passive SPI boot traces.  
**Status:** **RESEARCH / NOT A VERIFIED RELEASE.** This is a consolidation of additional public leads, not proof of physical testing by MODI. Older tools are not described as newly released. Existing project documents remain the baseline.

## 0. Evidence classes, hard boundaries, data policy

- **PUBLIC CODE CHECKED:** repository exists and the cited source/CSV was inspected on 2026-10-12; this does **not** prove Series X/S bench compatibility.
- **PUBLIC DESCRIPTION:** third-party statement/documentation; exact claims may be build- and motherboard-dependent.
- **MODI BENCH TEST NEEDED:** no reliable console-specific verification yet.
- **HYPOTHESIS:** plausible association, not an established root cause.
- Never conflate (1) NVMe XBFS, (2) Southbridge SBFS/U25 and (3) Dev Mode-visible ETL/logs. A raw 1 GiB XBFS image is **not** a 1 GiB U25 dump.
- Preserve untouched evidence; hashes + source + timestamps + revisions. No writes/formatting/patching during research. Protect console-specific certificate and ID data in public exports.

## 1. POST codes to add to the diagnostic knowledge base

**PUBLIC CODE CHECKED:** [Xbox One Research errorcodes / postcodes.csv](https://github.com/xboxoneresearch/errorcodes/blob/main/postcodes.csv) contains the following entries for `XSS,XSX`. These are community descriptions, **not proof of the failed component**:

| POST (SP/SMC) | Label | Public lead / suggested cross-check |
|---|---|---|
| `0xE406` (SP) | `NOR1` | Community reports corrupted NOR; take repeatable read-only SPI dump; **not** confirmed to mean U25 specifically. |
| `0x0781` (SP) | `DECRYPT_1` | Possible mismatched SSD / corrupted NOR. |
| `0x01A3` (SP) | `DECRYPT_2` | Seen with mismatched SSD; NOR or SSD state may matter. |
| `0x03A3` (SP) | `DECRYPT_3` | Reported with faulty SSD; corroborate SMART, GPT/XBFS and NOR. |
| `0x0AF3` (SP) | `DECRYPT_4` | Similar lead, **not** an independent SSD-failure verdict. |
| `0x0A80` (SMC) | `SSD_INIT2` | 1 s on/off symptom in community notes, possible SSD mismatch/bad SSD. |
| `0x04E6` (SP) | `BL_MISS` | Seen with mismatched Southbridge board; NOR/SSD association tentative. |

**Implementation:** import CSV as versioned data, record source URL and capture date, expose `raw_code`, `stage` (SMC/SP), model applicability and evidence status. Never turn `DECRYPT_*` or `NOR1` into an automatic instruction to replace hardware. Proposed case label: `SSD / NOR / secure-boot correlation`.

### Xbox Series X RAM bank codes (model-specific masked entries)

The same public CSV includes `XSX` / `SP` records. Examples:

| Code | Mask in CSV | Bank |
|---|---|---|
| `0xAA01` | `0xFE01` | E |
| `0xAA02` | `0xFE02` | F |
| `0xAA04` | `0xFE04` | B |
| `0xBB08` | `0xFF08` | I |
| `0xAA20` | `0xFE20` | G |
| `0xAA00` | empty | J |

The repo has further Series S/X RAM variants; **import the entire upstream data rather than hard-code this short table.** Match platform/stage, handle masks according to upstream rules, keep exact-code vs masked-code priority deterministic, test for collisions, and preserve raw code on ambiguous matches. A bank hint is **not** a definitive diagnosis of the RAM IC; verify rails, resistors, tracks and the APU path first. Relevant upstream change references: [July 2026 additions](https://github.com/xboxoneresearch/errorcodes/commit/02a99330bd9735e052e461cc90600d9cdaf92a6f) and [August bank J correction](https://github.com/xboxoneresearch/errorcodes/commit/077a5ee43fd4add6fb2fe9e9992d9687c0cbc91f).

## 2. SBFS parser discrepancy — do not blindly copy `sbfs-tool`

**PUBLIC CODE CHECKED:**
- [Southbridge File System documentation](https://github.com/xboxoneresearch/wiki/blob/master/docs/boot/southbridge-file-system.md): `SFBS` header magic; candidate headers `0x10000` / `0x11000`; page size `0x1000`; documented `MAX_FILE_COUNT: 24`.
- [RetroTechCorner/sbfs-tool Go code](https://github.com/RetroTechCorner/sbfs-tool/blob/main/sbfs-tool.go): defines `SBFS_NUM_FILES = 12` and embeds only a limited filename list.

These are **not interchangeable** assumptions. Parser review tasks:
1. Read both candidate headers only in a verified read-only image; validate magic, available length, arithmetic/bounds and the format's own declared sizes.
2. Separate format capacity (`24`) from this implementation's loop bound (`12`); handle unknown entries/names safely; preserve raw slots.
3. Inspect header digest offsets and byte ranges against upstream structures rather than assuming the Go source is a canonical serializer.
4. Compare duplicated headers/sequence numbers; flag inconsistent entries as `UNKNOWN` instead of attempting repair.
5. Test with unit fixtures (truncated image, invalid offsets, duplicate names, zero size, 24 entries, checksum mismatch, unsupported layout).
6. A candidate `SFBS` signature in physical U25 is **not yet demonstrated**. Do not assert `U25 == entire SBFS`.

**Physical U25 workflow:** chip marking + orientation + datasheet + electrical checks, 2–3 independent raw reads, byte-length and SHA-256 match, then header scan and read-only diff. The 8-pin 25-series working pinout (1 CS#, 2 DO, 3 WP#, 4 GND, 5 DI, 6 CLK, 7 HOLD#, 8 VCC) must be validated for the actual part and board; do not supply 5 V.

## 3. Passive SPI boot tracing as a *separate* evidence source

**PUBLIC CODE CHECKED:** [wrongbaud/spidump](https://github.com/wrongbaud/spidump) parses Saleae-style SPI/QSPI captures and reconstructs read regions from observed flash transactions; input support and examples are in its [README](https://github.com/wrongbaud/spidump/blob/main/README.md).

Example shown by the project:
```bash
python main.py examples/bigger-boot.csv -o recovered_flash.bin -v
```

**Proposed `SPI Boot Trace Analyzer`** (MODI BENCH TEST NEEDED):
1. Confirm actual flash chip and logic levels, probe `CS#`, `CLK`, `MOSI`, `MISO` plus QSPI IO lines if used; passively capture at power-on with a compatible high-impedance analyzer.
2. Record board, analyzer sample rate, bus mode, trigger, captures and their hashes; ensure no bus contention.
3. Decode reads, addresses, opcode usage, order and coverage; reconstruct **only addresses actually seen on the bus**.
4. Correlate a healthy boot vs a failed boot/update and a separate verified physical NOR image.
5. Import into a timeline: `POST -> SPI read interval -> update ETL / last error -> shutdown`; distinguish inferred causation from temporal coincidence.

A partial reconstructed image is **not a complete NOR backup**. `spidump` has not been validated by us on Series U25; leave the module tagged `EXPERIMENTAL`.

## 4. Alternative external POST acquisition — Flipper Zero

**PUBLIC CODE CHECKED:** [coolshrimp/flipperzero-xbox-post-code-reader](https://github.com/coolshrimp/flipperzero-xbox-post-code-reader) emulates the MAX6958 I²C POST display at `0x38`. README describes 452 bundled console-aware records and the Series AARDVARK path:
- Xbox Series AARDVARK **SDA pin 3** -> Flipper GPIO 15 / PC1;
- **SCL pin 1** -> Flipper GPIO 16 / PC0;
- connect grounds; check orientation, bus pull-ups, voltage compatibility and revision before attaching.
- Do not power the console from external 3.3 V pins.

Useful for **portable POST capture and offline decoding**, not as a replacement for raw POST logging, and not UART. Compare with existing [PicoDurangoPOST](https://github.com/xboxoneresearch/PicoDurangoPOST) and [XboxPostcodeMonitor](https://github.com/xboxoneresearch/XboxPostcodeMonitor). Import timestamps, raw codes, decoded hints, device and firmware version into the same case schema.

## 5. ODD/ODDFW errors and the 94% update case

**PUBLIC DESCRIPTION checked in:** [Xbox One Research ODD firmware-update log examples](https://github.com/xboxoneresearch/wiki/blob/master/docs/hardware/odd-firmware-update-log.md).

| HRESULT | Observed trace in documentation | What to check |
|---|---|---|
| `80910002` | `FAILED to find ODD physical device, status = 0xC000000E` | Missing/unreachable ODD, cable/power/device enumeration. |
| `80910008` | `Auth IOCTL ... failed` / ODD auth failure | ODD authorization path / controller pairing / associated firmware; **not** necessarily a failed laser. |

Treat error messages as log facts and hardware interpretation as conditional. Parser: search `SystemSupport\\oddfwupd\\*.log` if present; extract raw HRESULT, device lookup, auth IOCTL, timestamp, attempt number, OS build and final result. Any E100 screen code needs its own original full code (not inferred only from the percentage).

A publicly described Series X update stopping at ~94% survived SSD cloning/replacement and PSU replacement attempts; **this is anecdotal and does not establish a common root cause**. Never equate 94% with SSD, ODD, U25 or NOR damage. Prioritized evidence: live POST, ODD logs, ETL, XBFS BEFORE/AFTER, SMART/error log, GPT, physically verified U25 when safe.

## 6. Existing, distinct sources to correlate in the tool

| Source/method | Why useful | Constraints / status |
|---|---|---|
| NVMe SMART + Error Information Log + GPT (including backup GPT) | SSD condition, media errors, power cycles, unsafe shutdowns, partitions and anomalies | Existing research plan; SMART values are evidence, not cause by themselves. |
| XBFS (~`0x40000000` bytes logical region) | Parse boot entries `smcerr.log`, `update*.cfg`, `sp_s.cfg`, `certkeys.bin`; binary and extracted-file diff | [XBFS research](https://github.com/xboxoneresearch/wiki/blob/master/docs/boot/xbox-boot-file-system.md); actual data location/extraction must be validated per image. |
| `emoose/xvdtool` / `XbfsFile.cs` | Existing Series-aware XBFS parsing reference | [Code repository](https://github.com/emoose/xvdtool); verify license before copying source. |
| `TitleOS/QuantumTunnel` | Research access to `\\\\.\\Xvuc\\Flash` and `\\\\.\\Xvuc\\FlashFs` in suitable SYSTEM context | [Code](https://github.com/TitleOS/QuantumTunnel); requires privileges, not a retail cold-boot NOR/U25 reader. |
| Dev Mode Device Portal / `BlackBox` / `S:\\Deployment\\SoftwareDistribution` ETL | Software-side update timeline and HRESULTs | [Community Series research](https://github.com/Coolaid003/XboxSeries); build-/permission-dependent; `UNAVAILABLE` != no errors. See repo's existing `WINDOWS_UPDATE_ETL_DEV_MODE_RESEARCH_2026-10-10.md`. |
| ASPECT2 + `libaspect2` | Independent `flash_cli nor info/read` and board schematic candidates | [libaspect2](https://github.com/xboxoneresearch/libaspect2), [ASPECT2 PCB](https://github.com/xboxoneresearch/ASPECT2-PCB); Series U25 support **unverified**. Already documented in `ASPECT2_LIBASPECT2_SPI_FLASH_RESEARCH_2026-10-10.md`. |
| USB NTFS boot override / diagnostic triggers | Potential early boot/update probes when permitted by build | Public-research lead only; verify official upstream path, permissions and device effects in a controlled setup before using. Do **not** automatically create special USB trigger folders or modify update state. |
| `Console Diagnostic Pro` | Comparison target for Pico POST decoding UX and AARDVARK guidance | Third-party executable; source availability, exact supported hardware and release claims require separate review; do not bundle binaries without license/permission. |

## 7. Implementation queue (documentation and tasks only, no claims of shipped code)

**P0 — safe core data layer**
- [ ] Versioned importer for full upstream `postcodes.csv`, with platform/stage/mask resolution, conflict testing, raw-code retention and source timestamp.
- [ ] Case evidence schema `source_type`, SHA-256, acquisition method, console revision, OS build, raw timestamp and parser version.
- [ ] ODDFW error code recognizer + confidence/provenance tags; exclude root-cause diagnosis based solely on percentage progress.
- [ ] Read-only multi-dump U25 SHA-256 agreement check; no parsed offset conclusions until all same-board captures agree.

**P1 — parser & timelines**
- [ ] Hardened SBFS header/entry parsing with 24-vs-12 regression tests and unknown-filename support.
- [ ] Add `POST/I2C` session import (Pico/Flipper) with device-specific metadata and a single chronological event stream.
- [ ] Import Dev Mode ETL + ODDFW and XBFS dynamic-file change summaries; normalize `HRESULT`/raw codes.
- [ ] U25/SSD/XBFS independent provenance lanes in report and UI, not a merged undefined `flash` label.

**P2 — experiment**
- [ ] Bench-validate `spidump` against known-good capture; record bus configuration, coverage map, SHA-256 and recovery limitations.
- [ ] Check Series-specific USB boot diagnostic triggers **only** after exact code/build/restrictions are reviewed and with a reversible, read-only test.
- [ ] Reproduce 94%-failure collection with matched healthy reference plus same-console before/after snapshots.
- [ ] Decide whether any external parser code can be reused after its license is confirmed.

### Suggested report semantics
`OBSERVED` (raw evidence), `COMMUNITY_DOCUMENTED` (external data), `HYPOTHESIS`, `UNKNOWN`, `UNAVAILABLE`. Never display `CONFIRMED FAILURE OF U25` from `E406` alone.

## 8. Prior work / duplication guard
Already in this repository before this addendum:
- `docs/xbox-series/XBOX_LAB_1.0.1_RESEARCH_NOTES.md` (XBFS/SBFS/GPT/SMART/certificates);
- `docs/xbox-series/XBOX_LAB_CURRENT_STATE.md`;
- `SSD_NVME_AND_U25_DUMP_PLAN_2026-10-10.md`;
- `ASPECT2_LIBASPECT2_SPI_FLASH_RESEARCH_2026-10-10.md`;
- `WINDOWS_UPDATE_ETL_DEV_MODE_RESEARCH_2026-10-10.md`.

This addendum **does not replace those documents, implement software, validate a physical U25/SBFS map, or prove a fix for an update stuck at 94%.**
