# AGENT PROMPT — Analyze acquired Xbox Series dump

You are analyzing a dump acquired from the current Xbox Series X diagnostic case.

## Case context
- Console: Xbox Series X.
- Symptom: update loop around `Applying ~84% / Overall ~94%`, reboot/shutdown, sometimes update can complete but system may re-enter update.
- Internal SSD SMART appears healthy.
- The acquired dump was already sanity-checked by the operator and contains the expected console serial number, so acquisition is believed to be valid.
- Treat this dump as forensic evidence. READ ONLY. Never modify the source file.

## Mission
Determine exactly what the dump contains, validate its structure, extract every diagnostically useful object, and look for evidence related to the update loop, rollback/commit state, SMC errors, SSD/NOR mismatch, boot state or per-console configuration.

Do not assume in advance whether the file is XBFS, SPI/NOR/SBFS, a partition image, or another Xbox container. Detect first.

## Step 1 — preserve and fingerprint evidence
1. Record:
   - filename
   - exact byte size
   - SHA-256
   - SHA-1
   - MD5 only as an additional compatibility fingerprint
2. Never work on the original. Make a working copy.
3. Record entropy by blocks and identify large `00` / `FF` regions.
4. Run strings extraction in ASCII and UTF-16LE, but do not treat strings alone as structural proof.
5. Find all occurrences of:
   - console serial
   - device identifiers
   - GUIDs
   - build/version strings
   - timestamps
   - `E100`, `E101`, `E102`, `E200`
   - `8091`, `8007`
   - `smcerr`
   - `update`
   - `rollback`
   - `recovery`
   - `commit`
   - `staging`
   - `ODD`
   - `NOR`

Do not publish or commit unique certificates/keys/serials to a public repository. Redact sensitive values in public reports.

## Step 2 — auto-identify image type
Test for all of the following and report which signatures are actually present.

### Series XBFS candidate
Public Xbox Research documentation says Xbox Series S/X has a logical XBFS region of `0x40000000` bytes (1 GiB), with Series-specific file-table/header behavior and a documented `0x6000` offset adjustment for file location calculations.

If the dump is XBFS:
- locate every valid XBFS header/file table,
- report magic, format/version/sequence where available,
- determine which file table is active/newest,
- validate all entry offsets/sizes against image boundaries,
- flag overlap, truncation, invalid offsets or impossible lengths,
- inventory every file entry with offset, size and SHA-256.

Prioritize extraction/analysis of:
- `smcerr.log`
- `certkeys.bin`
- `mtedata.cfg`
- `smc_s.cfg`
- `smc_d.cfg`
- `sp_s.cfg`
- `os_d.cfg`
- `update.cfg`
- `update2.cfg`
- `recovery.dat`
- `dump.lng`
- XVD filenames/headers/metadata

Use existing read-only tools where useful:
- xboxoneresearch/wiki
- RetroTechCorner/xbfs-tool
- TitleOS/QuantumTunnel docs as reference
- xvdtool for metadata/parsing where applicable

Do NOT inject or rebuild XBFS.

### SPI/NOR + SBFS candidate
If this is a Southbridge SPI/NOR dump:
- search for SBFS magic `SFBS`,
- parse all valid SBFS headers/file tables,
- report format version, sequence version and layout version,
- determine redundant/active copies,
- extract files only from the working copy.

Known SBFS entries documented publicly include:
- `smcfw.bin`
- `psp1sp.bin`
- `speaker.bin`
- `smcerr.log`
- `smc_d.cfg`
- `certkeys.smc`

For each entry report:
- offset
- size
- SHA-256
- whether public documentation marks it as per-console/dynamic/static
- any internal version identifiers that can be parsed without guessing

Do NOT decrypt, alter or transplant per-console secrets.

## Step 3 — structural integrity audit
For whichever filesystem/container is detected:
1. Verify all headers and redundant tables independently.
2. Compare duplicated metadata copies.
3. Check sequence counters and identify the newest copy.
4. Check whether table entries are internally consistent.
5. Detect:
   - truncated files
   - impossible file lengths
   - bad offsets
   - overlapping extents
   - all-zero/all-FF damaged blocks
   - unexpectedly duplicated blocks
   - unusually high-entropy areas where plaintext/config is expected
6. If checksums/CRC fields are known from upstream source, verify them. Do not invent checksum algorithms.

## Step 4 — console identity validation
The operator already found the expected serial number in the dump.

Locate every occurrence of the serial and determine which structured object contains it.
Report:
- file/container path
- image offset
- context structure
- whether it is expected to be per-console data according to public documentation

Search for other identifiers but redact their full values in the report.
The goal is to confirm that the dump belongs to this exact console and identify which structures bind storage/boot data to the console.

## Step 5 — update-state investigation
This is the priority.

Analyze all available dynamic/update-related objects for evidence explaining a repeated failure near the end of update.

For each of these, if present:
- `update.cfg`
- `update2.cfg`
- `recovery.dat`
- `smcerr.log`
- `smc_d.cfg`
- update-related logs/metadata

Do:
1. Hex + structural examination.
2. Identify counters, sequence numbers, state enums, timestamps or version fields only where evidence supports the interpretation.
3. Search upstream Xbox Research code/wiki and public tooling for matching structures/constants.
4. Look specifically for state consistent with:
   - update pending
   - update completed but not committed
   - rollback requested
   - recovery requested
   - retry counter
   - failure/shutdown record
   - mismatched boot slot
   - SSD/NOR mismatch
5. Do not label arbitrary bytes as flags without evidence.

## Step 6 — SMC error investigation
If `smcerr.log` is present:
- extract it separately,
- determine its record size/format from upstream references/source if possible,
- enumerate every record,
- preserve raw hex for each record,
- map only codes that are supported by public documentation/error databases,
- sort chronologically if the format provides sequence/time information,
- highlight the newest records.

Cross-reference with `xboxoneresearch/errorcodes` and specifically pay attention to Series codes including public entries such as:
- `0x01A3 DECRYPT_2` — seen with mismatched SSD / corrupted NOR or SSD,
- `0x03A3 DECRYPT_3` — seen with faulty SSD / possible NOR/SSD corruption,
- `0x0AF3 DECRYPT_4` — seen with faulty SSD / possible NOR/SSD corruption,
- `0xE406 NOR1` — public DB says corrupted NOR / dump `SPI_FLASH`.

Do not conclude that a matching code proves a component is physically bad; report the DB wording and evidence separately.

## Step 7 — XVD / boot objects
Inventory all XVDs and boot-related binaries.
For each:
- filename
- size
- header information
- version/build info if parseable
- SHA-256
- truncation/corruption indicators

Do not attempt to bypass encryption or signatures. We only need integrity/metadata evidence.

## Step 8 — compare against public known structures
Research current public information before concluding anything.
Use:
- `xboxoneresearch/wiki`
- `xboxoneresearch/errorcodes`
- `xboxoneresearch/PicoDurangoPOST`
- `xboxoneresearch/ASPECT2-PCB`
- `RetroTechCorner/xbfs-tool`
- `RetroTechCorner/sbfs-tool`

If source code and documentation disagree, document the disagreement.

## Step 9 — prepare for BEFORE/AFTER experiment
This dump will become the BASELINE.
Create a machine-readable manifest containing:
- image SHA-256
- every extracted file path
- offset
- size
- SHA-256
- active table/header sequence

When a second dump is provided after exactly one controlled update/boot attempt, automatically produce:
- changed byte ranges
- number of changed bytes
- before/after hex snippets
- changed file-table/header sequence values
- added/deleted/changed files
- per-file SHA changes
- mapping of changed raw ranges back to files/structures

The highest-value targets for diff are:
- `smcerr.log`
- `smc_d.cfg`
- `update.cfg`
- `update2.cfg`
- `recovery.dat`
- any SBFS sequence/header state

## Required final report
Return these sections:

### 1. Dump identification
- detected format
- size
- SHA-256
- confidence

### 2. Structural health
- valid headers/tables
- active sequence
- corruption findings

### 3. Console identity
- expected serial found: YES/NO
- structure/file containing it
- identity consistency

### 4. Update-state findings
For every finding include:
- path / raw offset
- exact bytes/value
- source used to interpret it
- confidence

### 5. SMC errors
Table:
`record | raw code | decoded name | source | sequence/time | relevance`

### 6. Most important files
Table:
`name | offset | size | SHA-256 | role | status`

### 7. Conclusions
Separate strictly into:
- CONFIRMED
- STRONG EVIDENCE
- HYPOTHESIS
- UNKNOWN

### 8. Next test
State the single next experiment with the highest diagnostic value.

## Critical instruction
Do not stop after saying `dump OK`.
`Dump OK` only means acquisition/structure is readable. The task is to reverse-map the dynamic state and identify what changed or what state may explain the update loop.
