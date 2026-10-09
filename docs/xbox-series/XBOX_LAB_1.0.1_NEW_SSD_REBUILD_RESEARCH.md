# Xbox Lab v1.0.1 — New SSD / disk rebuild research

> Status: **EXPERIMENTAL / RESEARCH**  
> Scope: Xbox Series S / Xbox Series X  
> Purpose: determine whether Xbox Lab can prepare a brand-new NVMe for a Series console from a minimal set of required console-specific data instead of blindly cloning an entire donor SSD.

---

## 1. Core question

We want to establish whether a replacement Xbox Series NVMe can be built from scratch by Xbox Lab:

1. create the required GPT / partition layout on a blank NVMe,
2. recreate the necessary Xbox partitions/volumes,
3. restore or regenerate only the mandatory boot/support structures,
4. inject the console-specific data taken from the original console,
5. let the console / offline update repopulate everything that does not need to be preserved.

The long-term objective is a workflow closer to **"Prepare new Xbox Series SSD"** than **"sector-by-sector clone old disk"**.

Do **not** assume yet that this is possible. Treat it as a research target to prove experimentally.

---

## 2. Three possible replacement workflows to investigate

### A. Full clone — baseline

Known-safe reference method for testing:

- source SSD -> destination SSD sector-for-sector,
- then repair/expand partition table if required,
- boot/update console,
- compare resulting layout and files.

This is the control case. It tells us what a known-good replacement looks like.

### B. Partition-level migration

Instead of cloning the entire device:

- create the correct GPT on the new SSD,
- create/copy each required partition individually,
- restore only the dedicated Xbox boot area / XBFS and any required support partitions,
- leave non-essential/update-generated data clean where possible.

Goal: determine which partitions really have to be copied and which can be recreated.

### C. Minimal rebuild — target research mode

Ultimate research target:

- start from a blank NVMe,
- create the expected Series disk layout,
- write only the minimum console-specific content,
- supply official update/recovery content where appropriate,
- let the console rebuild the remaining state.

Possible future Xbox Lab button:

```text
[ PREPARE NEW SERIES SSD ]

Source console data:     VERIFIED
Destination NVMe:        FOUND
Partition template:      MATCHED
Console-specific files:  READY

[ BUILD REPLACEMENT SSD ]
```

This must remain disabled until the required structures are proven with multiple consoles.

---

## 3. What must be captured from the original console before rebuilding

Xbox Lab should collect as much as possible before touching the replacement drive.

### From the original NVMe

- full GPT / partition map,
- raw first/last sectors containing GPT metadata,
- logical XBFS raw image,
- parsed XBFS contents,
- System Support / diagnostic partition contents relevant to service,
- update state/configuration files,
- partition GUIDs and type GUIDs,
- filesystem/volume identifiers where readable,
- hashes of all collected data,
- NVMe SMART data.

### Console-specific XBFS material to track

At minimum investigate preservation requirements for:

- `certkeys.bin`,
- `sp_s.cfg`,
- console certificate inside `sp_s.cfg`,
- `smc_d.cfg`,
- `sp_d.cfg`,
- `os_d.cfg`,
- `update.cfg`,
- `update2.cfg`,
- `recovery.dat`,
- any other file shown by A/B testing to vary per console.

Do not assume every listed file must be copied. The purpose of the experiments is to separate:

- **mandatory per-console**,
- **regeneratable**,
- **update-generated**,
- **static/common**,
- **diagnostic only**.

### From Southbridge / U25 when available

Keep this as a separate acquisition path:

- raw U25 SPI NOR dump,
- 2–3 matching reads / SHA-256 verification,
- parsed SBFS if `SFBS` is confirmed,
- `certkeys.smc`,
- `smcerr.log`,
- `smc_d.cfg`,
- other discovered SBFS files.

Do not assume U25 must be rewritten when replacing only the SSD. It is being collected so we can correlate SSD state with Southbridge state.

---

## 4. Hidden / non-obvious storage areas

The program must **not** limit analysis to the visible ~1 GB XBFS region.

For every test SSD:

1. enumerate the entire physical disk,
2. parse primary and backup GPT,
3. record every partition, including unknown/unmounted partitions,
4. inspect gaps/unallocated regions for signatures,
5. compare first/last LBAs across known-good drives,
6. inspect any hidden System Support / service data area,
7. preserve unknown regions in research captures until their purpose is understood.

Research question raised during service work:

> Is there an additional hidden/service partition or region that carries state needed during replacement/update and is currently missed when we only dump XBFS?

Xbox Lab should answer this by inventorying **the whole device**, not by relying on Windows-visible volumes alone.

---

## 5. System Support / error collection

The replacement/rebuild workflow should automatically collect the diagnostic data before and after each test.

Required behavior:

- locate System Support / support/diagnostic volumes,
- recursively inventory files,
- preserve source path + timestamp + SHA-256,
- extract known log/config/error files,
- retain unknown files for future parsing,
- normalize discovered errors into the Xbox Lab report.

Candidates include:

```text
*.log
*.etl
*.dmp
*.dmpx
*.cfg
*.xml
*.json
*error*
*update*
*crash*
*blackbox*
```

The point is to correlate:

- disk preparation method,
- update percentage/failure point,
- XBFS state,
- SBFS state,
- logs/errors,
- SMART health.

---

## 6. Automatic identity / health report before any rebuild

Immediately after reading a Series SSD Xbox Lab should show:

### Console identity

- Console Serial Number,
- SKU,
- Part Number,
- SoC ID,
- Generation ID,
- Region,
- console certificate structure status,
- signature verification state separately from structure validation.

### SSD health

- model,
- serial,
- firmware,
- temperature,
- Critical Warning,
- Percentage Used,
- Available Spare,
- Data Units Read/Written,
- Controller Busy Time,
- **Power On Hours**,
- Power Cycles,
- Unsafe Shutdowns,
- Media/Data Integrity Errors,
- Error Information Log Entries.

This allows us to distinguish a bad disk from a bad Series software/storage state before rebuilding anything.

---

## 7. Minimal image concept

Investigate whether a compact **Xbox Lab recovery package** can be generated from one console.

Instead of backing up the entire SSD, store only:

```text
console-backup/
  manifest.json
  partition_map.json
  gpt/
    primary_gpt.bin
    backup_gpt.bin
  xbfs/
    xbfs_raw.bin              # initially keep full raw for safety
    extracted/
      ...
  sbfs/
    u25_raw.bin               # optional physical acquisition
    extracted/
      ...
  system_support/
    ...selected diagnostic files...
  smart/
    original_nvme.json
  hashes.sha256
```

As research progresses, determine whether `xbfs_raw.bin` can itself be replaced by a much smaller set of mandatory extracted files plus a generated clean XBFS structure.

Possible future package names:

- `Xbox Lab Console Backup`
- `Series Recovery Pack`
- `Series SSD Identity Pack`

The package must clearly indicate what was actually captured and what was regenerated.

---

## 8. Rebuilding XBFS instead of copying it wholesale

Research target:

1. understand XBFS header/layout sufficiently to generate a clean filesystem image,
2. determine which entries are common/static,
3. determine which are per-console,
4. determine sequence/layout/hash requirements,
5. inject original console-specific files,
6. recalculate required hashes/checksums,
7. write generated XBFS to the proper disk location,
8. test boot/update behavior.

Do not ship a writer until parser/validator results are reliable.

Potential final workflow:

```text
Read original SSD
    -> Extract console identity + required per-console files
    -> Generate clean XBFS
    -> Insert console-specific files
    -> Validate XBFS
    -> Create GPT/partitions on replacement NVMe
    -> Write XBFS + required support data
    -> Verify byte-for-byte written structures
    -> User installs SSD
    -> Console recovery/update
```

---

## 9. Partition template research

For each known-good Series S/X SSD sample record:

- total drive capacity,
- logical/physical sector size,
- GPT disk GUID,
- partition count,
- partition type GUID,
- partition unique GUID,
- start LBA,
- end LBA,
- size,
- alignment,
- attributes,
- labels,
- recognizable filesystem,
- used/free content where readable.

Build a comparison matrix across multiple consoles/capacities.

Questions to answer:

1. Are Series X and Series S partition templates identical?
2. Does layout vary with SSD capacity/model/revision?
3. Which GUIDs are static vs generated per disk?
4. Does Xbox tolerate regenerated partition unique GUIDs?
5. Which partitions can be empty and rebuilt by recovery/update?
6. Which exact region contains XBFS relative to the physical disk?
7. Is any data outside defined GPT partitions required?

Until these are known, do not hard-code one universal partition table.

---

## 10. A/B experiments required

### Experiment 1 — full clone

- clone known-good original to destination,
- verify boot,
- record resulting update state.

### Experiment 2 — recreated GPT + copied partitions

- generate GPT from captured map,
- copy partitions individually,
- verify boot/update.

### Experiment 3 — recreated GPT + XBFS only

- write only the presumed essential boot area plus official recovery/update path,
- observe failure point and logs.

### Experiment 4 — remove one component at a time

Starting from a working reconstructed SSD, omit/zero one candidate item per test to determine necessity.

Examples:

- System Support contents,
- selected dynamic config,
- update state files,
- non-console-specific XBFS entries.

Never change multiple unknown variables in the same experiment if the goal is to identify what is essential.

### Experiment 5 — failing 94% console

For the existing console that repeatedly stalls around 94%:

- capture old SSD completely,
- capture SMART,
- capture GPT/layout,
- parse XBFS,
- capture logs,
- capture U25/SBFS if available,
- prepare replacement with each progressively smaller method,
- compare the exact error/log state after each attempt.

This case can help identify whether the failure is disk layout, console-specific metadata, update state, SBFS state or unrelated hardware.

---

## 11. Safety / write policy

Xbox Lab v1.0.1 remains **read-first**.

Before any future SSD build/write operation:

- require source backup,
- require SHA-256 validation,
- identify source and destination by model + serial + capacity,
- show destructive-operation warning,
- never write to U25 automatically,
- verify every written critical region after write,
- save a build manifest describing every byte range written/generated.

A new-SSD builder should write only to the selected replacement SSD, never modify the original acquisition source.

---

## 12. Future GUI concept

```text
XBOX LAB — SERIES SSD RECOVERY

Original Console
  Serial:              123456789012
  Certificate:         STRUCTURE OK
  XBFS:                VALID
  SBFS/U25:            CAPTURED / NOT CAPTURED

Original SSD
  Model:               ...
  Power-On Hours:      ...
  Health:              OK / WARNING / CRITICAL

Replacement SSD
  Model:               ...
  Capacity:            ...
  Status:              BLANK / EXISTING DATA

Recovery Data
  Partition Map:       READY
  Console Identity:    READY
  Required Files:      READY / INCOMPLETE
  Logs Backup:         READY

Mode
  ( ) Full Clone
  ( ) Rebuild Partitions + Preserve Required Data
  ( ) Experimental Minimal Rebuild

[ ANALYZE ]   [ BUILD REPLACEMENT SSD ]
```

Experimental mode must remain clearly marked until validated across multiple Series consoles.

---

## 13. Web-tool concept

Long-term idea discussed for Xbox Lab:

A user could dump the required Series storage data using the local Xbox Lab acquisition tool, then load the resulting package into a browser/web application for analysis.

Web analysis could provide:

- console identity,
- certificate structure status,
- SSD SMART summary,
- Power-On Hours,
- XBFS health,
- SBFS/U25 health if supplied,
- error/log decoding,
- comparison against known-good structures,
- guidance on exactly what must be backed up before replacing the SSD,
- generation of a recovery/rebuild manifest.

For privacy/security, console-unique material should not be uploaded by default unless the user explicitly chooses server-side analysis; a local/offline browser parser is preferable where feasible.

---

## 14. What the agent must research next

1. Find and verify **Series-specific** public tools/scripts capable of preparing/repartitioning a blank Xbox Series NVMe; do not confuse Xbox One scripts with Series support.
2. Collect public documentation for the complete Series GPT/partition layout.
3. Determine whether any existing tool already generates XBFS or only parses/extracts it.
4. Determine whether official recovery/update can recreate normal partitions after a minimal disk is prepared.
5. Identify which XBFS files are definitely per-console and which are common.
6. Determine whether the disk contains required data outside normal GPT partitions.
7. Parse several known-good Series drives and build a layout database.
8. Compare a fresh/working console before vs after system update.
9. Compare full SSD state with U25/SBFS before vs after update.
10. Document every assumption with confidence: `VERIFIED`, `PUBLIC-DOC`, `OBSERVED`, `HYPOTHESIS`.

---

## 15. Project principle

Do not build a "magic Series SSD writer" from assumptions.

First build an analyzer that can explain a Series disk completely enough that we know:

- what is static,
- what belongs uniquely to the console,
- what belongs uniquely to the SSD,
- what is generated by updates,
- what can be recreated,
- what must be preserved.

Once that is proven, the same knowledge can become an automated replacement-SSD builder.