# Xbox Series Diagnostic Universal Tool — Developer Mode / Device Portal access checklist
Date: 2026-10-09
Status: planned validation checklist; user's exact tester tier and endpoint access are not yet verified.

## Goal
Establish which software-visible diagnostics can be collected from the user's Xbox Series X/S using Developer Mode and Xbox Device Portal before designing an automated Reference Console Capture workflow.

## Current known situation
- User reports having Developer Mode and says they may be in one of the Xbox tester groups.
- Do not assume the tester group grants privileged GDK APIs, raw SSD access, NOR/SPI access, or UART access.
- The prior project note `REFERENCE_CONSOLE_CAPTURE_XBOX_DEVICE_PORTAL_2026-10-09.md` records `xb_wdp_rest.py` as a candidate software-side collector.
- Repository: https://github.com/modyfikatorcasper/Xbox-360-Diagnostic-Maps-

## Access layers to distinguish
1. **Developer Mode**: permits running developer apps and is the starting point, not proof that every diagnostic API is available.
2. **Xbox Device Portal (WDP)**: network-accessible web UI/API, if enabled and reachable; configure authentication and use the local network address.
3. **API/feature permissions**: individual endpoints and data can vary by console configuration, mode, OS build, authentication, and permission level.
4. **Tester / GDK program status**: exact program and tier are unknown. Verify by checking the account/program UI and the actual available tooling; do not infer access from being a tester alone.
5. **Hardware acquisition**: physical SSD/NVMe imaging, raw NOR/SPI reads, UART and external POST capture are separate workflows and are not granted by WDP.

## Validation checklist
- [ ] Open Dev Home in Xbox Developer Mode.
- [ ] Locate Device Portal settings and enable WDP if available.
- [ ] Record the portal address shown by the console (do not publish credentials).
- [ ] From a PC on the same LAN, open the portal and confirm authentication works.
- [ ] Record console model, OS/build, Dev Mode status and test date.
- [ ] Run read-only baseline queries first: snapshot/system info, ETW provider inventory, WER listing and WPR status, where supported by the current `xb_wdp_rest.py` version.
- [ ] Save raw outputs unchanged; note endpoint errors and permissions rather than assuming feature absence.
- [ ] Test WPR/ETW capture only after baseline succeeds, and only on a known-good development console.
- [ ] Repeat a controlled boot/update test and compare timestamped outputs.
- [ ] Keep source labels separate: `DEVICE_PORTAL`, `ETW`, `WER`, `WPR`, `SSD_IMAGE`, `XBFS`, `NOR_SPI`, `POST`, `UART`.

## Interpretation
- If WDP works, software-level snapshots and available logs may be collected while the OS and portal are running.
- If the console fails before the OS/WDP services start, WDP may provide no evidence of the earliest boot stage.
- WDP collection is not a physical disk image, raw NOR/SPI dump, or UART capture.
- A Dev Mode-enabled console is a good starting point, but successful access to each endpoint must be verified empirically.
- Do not claim that the user's tester group is sufficient until the specific group and endpoint behavior are confirmed.

## Candidate repository and documentation
- Collector candidate: https://github.com/DanielLMcGuire/xboxtools
- Xbox Series architecture research: https://github.com/DanielLMcGuire/XboxSeries
- Microsoft Device Portal overview: https://learn.microsoft.com/en-us/windows/uwp/debug-test-perf/device-portal

## Next action
Ask the user only for the first decisive observation: can they open Dev Home and reach Xbox Device Portal from a PC browser? If yes, proceed with a minimal read-only API test. If not, guide them to the portal setting before investigating program-tier permissions.
