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
