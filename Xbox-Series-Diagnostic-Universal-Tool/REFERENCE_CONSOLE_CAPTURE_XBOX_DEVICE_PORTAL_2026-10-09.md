# Xbox Series Diagnostic Universal Tool — Reference Console Capture
Date: 2026-10-09
Status: research note / candidate workflow, not yet validated on our hardware

## Candidate reference
- Repository: https://github.com/DanielLMcGuire/xboxtools
- Script: `xb_wdp_rest.py`
- Architecture research: https://github.com/DanielLMcGuire/XboxSeries
- Microsoft Device Portal API overview: https://learn.microsoft.com/en-us/windows/uwp/debug-test-perf/device-portal

## What data does this collect?
This is **software/OS-level collection over Xbox Device Portal**, not a physical SSD/NVMe dump and not a NOR/SPI flash dump.

Depending on the endpoint, permissions and console configuration, it can collect:
- system/device information and snapshots exposed by the running OS;
- registered ETW providers and event traces;
- Windows Error Reporting (WER) reports exposed by Device Portal;
- Windows Performance Recorder (WPR) traces, including boot-performance traces where supported;
- available process/user-mode dumps and other Device Portal diagnostics.

These are data produced or exposed by SystemOS/Windows services and stored/served by the running console OS. They can contain evidence about software startup, update activity, service failures and crashes, but they do not directly reveal raw NAND/NOR contents, the physical NVMe sectors, or pre-OS boot activity that happened before these services became available.

## Preconditions and limits
- Requires a console with Developer Mode / Device Portal enabled and reachable, plus valid credentials and permissions.
- Endpoint availability can differ by console mode; some kernel/bugcheck dump and boot-tracing endpoints may be restricted.
- Do not assume retail-mode or non-booting consoles will expose these APIs.
- Validate each command and output against a known-good development console before integrating it.
- Treat this as a **reference-console capture** module, complementary to (not a replacement for) physical SSD/XBFS and NOR/SPI workflows.

## Suggested workflow
1. On a known-good console with Device Portal enabled, record console model, OS/build, date/time and update state.
2. Use `xb_wdp_rest.py` to collect a snapshot, ETW provider inventory, WER reports and WPR status/traces where available.
3. Preserve original outputs unchanged; calculate SHA-256 hashes and record tool/script version.
4. Repeat before and after a controlled update or boot test, keeping test conditions documented.
5. Compare inventories and reports, then correlate timestamps with independently acquired SSD/XBFS metadata, physical flash dumps, POST capture or UART logs if available.
6. Label every result by source: `DEVICE_PORTAL`, `ETW`, `WER`, `WPR`, `SSD_IMAGE`, `XBFS`, `NOR_SPI`, `POST`, or `UART`. Never mix these evidence classes without provenance.

## Example commands to validate
The exact CLI syntax should be checked against the current repository README/script before use. Previously identified candidate commands:
```bash
python xb_wdp_rest.py --host Xbox snapshot
python xb_wdp_rest.py --host Xbox etw
python xb_wdp_rest.py --host Xbox wer
python xb_wdp_rest.py --host Xbox wprstatus
```

## Project decision
Keep this as a candidate for a read-only **Reference Console Capture / Update Forensics** module. It may help build a baseline and compare software-visible behavior around an update, but it does not by itself diagnose a console stuck at 94%, nor provide raw SSD/NOR/UART access.
