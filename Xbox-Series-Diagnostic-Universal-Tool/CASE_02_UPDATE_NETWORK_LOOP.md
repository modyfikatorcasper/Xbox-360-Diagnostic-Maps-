# Xbox Lab — Case 02: Xbox Series update loop with apparent network failure

Status: EXPERIMENTAL / RESEARCH
Date added: 2026-10-09

## Symptom

Console boots and otherwise works, but system update enters a loop. Behaviour differs from the separate ~94% update-loop case: this unit appears to fail as if it cannot establish or retain Internet connectivity during update.

## Why this case matters

Treat this as a separate failure class from the ~94% update-loop console. The goal is to determine whether the root cause is:

1. actual network / Windows Update discovery failure,
2. update-state corruption in XBFS / System Support / deployment metadata,
3. SSD / filesystem integrity problem,
4. console-specific validation mismatch involving XBFS vs Southbridge/NOR/SBFS,
5. another subsystem failure that only presents as a network/update error.

## Public research lead

Public Xbox Series research has documented Windows Update sessions where the update service started while networking was unavailable, immediately failed discovery with `0x8024402C`, and did not retry after the network came online a few seconds later. This is NOT proof that this console has the same issue, but it makes network timing/state a real test target rather than an assumption.

Reference:
- https://github.com/Coolaid003/XboxSeries

## Preserve evidence before changing anything

Capture before any repair attempt:

- exact console model / board revision,
- current OS build,
- exact on-screen update error / E-code / percentage / stage,
- Ethernet vs Wi-Fi behaviour,
- time from boot/update start to apparent network failure,
- SSD identify data,
- SSD SMART / health / power-on hours,
- GPT / partition layout,
- full 1 GB XBFS dump x2,
- SHA-256 of both XBFS reads,
- XBFS inventory and extracted files,
- `sp_s.cfg`,
- `certkeys.bin`,
- `smcerr.log`,
- `update.cfg`,
- `update2.cfg`,
- complete accessible `System Support` tree,
- update/setup/error logs,
- `SystemSupport/oddfwupd/*.log` when present,
- live POST log if available,
- U25 / SPI NOR dump x2 when electrically safe,
- hashes for both NOR reads,
- SBFS parse/inventory if the dump proves to contain parseable SBFS.

## Network-specific test matrix

Perform these only after the first full evidence capture:

### A. Wired Ethernet
- cold boot with cable already connected,
- verify link before starting update,
- attempt update,
- preserve post-attempt logs.

### B. Wi-Fi
- cold boot with known-good saved network,
- attempt update,
- preserve post-attempt logs.

### C. Offline System Update / recovery path
- where supported for the exact console/update state, test the official offline recovery path,
- compare whether failure stage changes,
- preserve logs before and after.

### D. Controlled timing test
- observe whether networking is actually available before update discovery begins,
- compare a boot where network is ready immediately versus one where connectivity appears late,
- check for `0x8024402C` or equivalent update/discovery failures in captured logs.

## Comparison against Case 01 (~94% loop)

Xbox Lab should generate a side-by-side report covering:

- OS build,
- update stage / percentage,
- E-code / HRESULT / NTSTATUS,
- SSD model + firmware,
- SMART health,
- XBFS hash,
- XBFS file inventory,
- changed XBFS ranges,
- `sp_s.cfg` parse result,
- `certkeys.bin` presence/parse status,
- `smcerr.log`,
- `update.cfg` / `update2.cfg`,
- System Support timeline,
- POST sequence,
- NOR/SBFS hash and diff where available,
- network-discovery errors.

## Xbox Lab implementation requirement

Add a dedicated update/network diagnostic parser. It should classify findings such as:

- NETWORK_UNAVAILABLE_AT_DISCOVERY
- WINDOWS_UPDATE_DISCOVERY_FAILED
- LATE_NETWORK_AVAILABILITY
- UPDATE_METADATA_CORRUPTION_SUSPECTED
- XBFS_INTEGRITY_WARNING
- SSD_HEALTH_WARNING
- XBFS_SBFS_MISMATCH_SUSPECTED
- UNKNOWN_UPDATE_LOOP

Do not label a network symptom as a network root cause until logs support it.

## Immediate workshop workflow

1. Do not repair or rewrite the SSD first.
2. Capture Case 02 evidence package.
3. Attempt one wired cold-boot update with network available before boot.
4. Capture logs again.
5. Attempt official offline update/recovery only if appropriate for the console state.
6. Capture logs again.
7. Compare Case 02 against Case 01.
8. Only then consider SSD recreation, XBFS restoration, or U25/SBFS intervention.
