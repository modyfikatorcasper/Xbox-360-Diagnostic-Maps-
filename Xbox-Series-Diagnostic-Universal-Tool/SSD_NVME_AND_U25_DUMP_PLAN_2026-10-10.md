# Xbox Series Diagnostic Universal Tool — SSD/NVMe + U25 plan (2026-10-10)

## SSD/NVMe Health & Layout Inspector
Reference: https://gist.github.com/alexmi256/e1b9b31c33d410c787ebe66eec5c7f89 (Xbox Series S SSD case). Implement read-only import of NVMe SMART and error logs, GPT partition table validation (primary/backup), partition size/layout, XBFS signatures, temperature sensors, critical warnings, unsafe shutdowns, and before/after comparison. Do not infer root cause from SMART alone. Do not modify source SSD or repair GPT automatically.

## Xbox Series X Southbridge U25 SPI NOR
Hardware research target: U25 3.3V SPI NOR, Toledo SB schematic. Pinout: 1 CS#, 2 DO/MISO, 3 WP#, 4 GND, 5 DI/MOSI, 6 CLK, 7 HOLD#, 8 VCC 3.3V. Confirm actual chip marking, voltage, orientation and in-circuit loading before attaching programmer. Never apply 5V.

### Capture protocol
- Obtain 2–3 full reads from the same unmodified console/chip, with unique names U25_boardID_read01.bin etc.
- Record chip ID, board revision, programmer, settings, byte count, UTC timestamp and SHA-256 per read.
- Verify identical size and SHA-256 across all reads; if mismatch, stop and investigate wiring, supply, SPI speed and bus contention. Preserve all raw dumps.
- Repeat for working reference boards and faulty board; if possible capture the same board before and after system update.
- Analyze only verified dumps: byte-wise diffs, contiguous changed ranges/offsets, entropy, ASCII/UTF-16 strings, magic/header candidates, blank/FF regions, per-console unique blocks, update-sensitive regions. Unknown means unknown: no invented field map.
- Export machine-readable JSON and human-readable HTML/Markdown reports; maintain provenance and redact potentially sensitive device identifiers from shared reports.
- Initial implementation is strictly read-only: no writes or automated patching.

## App build acceptance criteria
1. Import multiple U25 dumps, calculate SHA-256 and verify consistency.
2. Compare same-board and cross-board samples with offset maps and change summaries.
3. Import SSD SMART/GPT reports separately; show evidence origin clearly (NVMe vs SPI NOR vs Device Portal).
4. Export comparison report; distinguish confirmed findings, hypotheses, and unknowns.
5. Regression-test with sample files before packaging. No assertion that U25 contents map is known yet.

## Today’s workflow
User plans first 2–3 U25 dumps. After captures, compare hashes before interpreting offsets. Do not confuse U25 NOR with Xbox SSD/NVMe or Device Portal traces.

## Product goals — what Xbox Lab must extract (developer brief)

**Purpose:** Turn Xbox Series X/S diagnostics into evidence-based fault localization and repeatable comparisons, especially consoles stuck at 94% of an update. Do not promise repair or decoding of undocumented structures without proof.

### Desired answers from each evidence source
- **U25 SPI NOR:** discover real data structure/map from multiple verified dumps; identify stable vs variable ranges, possible version/build markers, per-console data, checksums, update/provisioning changes and correlations with boot/update failures. Treat every interpretation as a hypothesis until validated on multiple samples. Build a growing annotated offset database with confidence and supporting samples.
- **SSD/NVMe:** determine controller/media health, temperatures, error-log events, unsafe shutdowns, GPT integrity, XBFS signatures and partition layout; flag anomalies and compare against known-good references. Distinguish thermal alerts from actual NAND degradation.
- **Device Portal / ETW / WER / WPR (Dev Mode):** import system traces, crash reports and capability results; handle permission denials as 'unavailable', not 'no error'.
- **UART/POST and optional cold-boot USB:** accept timestamped captures and correlate with other evidence; never label unsupported interfaces as confirmed.

### User workflow in the new application
1. Create case with console model, motherboard revision, firmware (if known), symptom, capture date and evidence origin.
2. Import 2–3 U25 dumps from one board. Automatically validate sizes/hashes, mark MATCH/MISMATCH and block conclusions when reads are inconsistent.
3. Compare confirmed U25 image against reference boards and before/after updates. Show hex view, changed offset intervals, byte counts, percentage changed, entropy, string candidates, bookmarks and exportable diff.
4. Import SSD NVMe SMART/error log and GPT/partition metadata. Highlight critical warnings and anomalies, preserving raw source.
5. Attach POST/UART/ETW/WER evidence as available. Build timeline of observable events and correlations, never fabricated causal chains.
6. Produce case report with **observed fact / interpretation / confidence / next diagnostic test**, export JSON and HTML/Markdown; provide optional redaction for console-unique identifiers.

### Specific 94% update investigation
Collect at least one healthy reference and a faulty case; compare U25 images and SSD metadata before/after an update when feasible. Identify differences that *correlate* with failed update stage, not automatically assume causation. Include evidence matrix and prioritized next tests (storage, boot chain, firmware, communication). The application must never write or repair NOR/SSD as part of initial diagnostics.

### Definition of done for next compilation
- Working import, SHA-256 validation and byte-range U25 diff; meaningful errors for incomplete/bad captures.
- Working SSD SMART/GPT metadata importer with health flags and evidence provenance.
- Case/report export, regression fixtures, documented unsupported functionality.
- Separate UI states: Verified, Suspected, Unknown, Unavailable. No hard-coded claims of decoded U25 offsets.

**Immediate handoff:** implement these capabilities in the next Xbox Lab build, starting with read-only U25 capture verification and diff. Today's first 2–3 raw dumps will serve as the initial fixture set only after hashes match. Preserve originals unchanged.
